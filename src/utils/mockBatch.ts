import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to find an active batch with available capacity (30 students) or create a
// new one automatically. This mirrors the logic previously inline in
// AkboyMockRegistration, but extracted so that schools and single users can
// reuse it.
// 
// NOTE: Database trigger `trigger_check_batch_capacity` automatically marks
// batches as is_active=false once they reach 30+ registrations. This function
// only queries is_active=true batches, ensuring we never over-assign to full batches.
export async function getOrCreateBatch(supabase: SupabaseClient, settings: any, registrationMode: string = 'virtual') {
  // constants used for scheduling
  const BATCH_CAPACITY = 30;

  // For physical registrations, always use the dedicated Physical Exam Batch
  // scheduled for April 4-5, 2026
  if (registrationMode === 'physical') {
    const { data: physicalBatch } = await supabase
      .from("mock_batches" as any)
      .select("*")
      .eq("title", "Physical Exam Batch")
      .eq("is_active", true)
      .limit(1)
      .single();
    
    if (physicalBatch) {
      return physicalBatch;
    }
    
    // If Physical Exam Batch doesn't exist, create it
    const physicalExamDate = new Date(2026, 3, 4, 9, 0, 0); // April 4, 2026 at 9am
    const { data: newPhysicalBatch, error } = await supabase
      .from("mock_batches" as any)
      .insert({
        title: "Physical Exam Batch",
        exam_date: physicalExamDate.toISOString(),
        exam_venue: settings.default_exam_venue || null,
        is_active: true,
        batch_type: 'physical'  // Explicitly mark as physical
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    return newPhysicalBatch;
  }

  // fetch active batches sorted by exam_date ascending (for virtual registrations)
  // Use MULTIPLE filters to ensure Physical Exam Batch is never included:
  // 1. batch_type must be 'virtual'
  // 2. title must NOT be "Physical Exam Batch" (belt and suspenders)
  const { data: activeBatches, error: batchError } = await supabase
    .from("mock_batches" as any)
    .select("*")
    .eq("is_active", true)
    .eq("batch_type", "virtual")  // Only virtual batches
    .neq("title", "Physical Exam Batch")  // Extra safety: exclude Physical Exam Batch by title
    .order("exam_date", { ascending: true });
  
  if (batchError) {
    console.error("Error fetching virtual batches:", batchError);
  }

  // look for an existing batch with room
  if (activeBatches && activeBatches.length > 0) {
    for (const b of activeBatches) {
      // Safety check: skip if not virtual type (should not happen, but defensive)
      if (!b.id || b.batch_type !== "virtual") continue;
      
      // Count ALL registrations in this batch to check total capacity
      const { count } = await supabase
        .from("mock_registrations" as any)
        .select("id", { count: "exact", head: false })
        .eq("batch_id", b.id);
      const regCount = (count as number) || 0;
      if (regCount < BATCH_CAPACITY) {
        return b;
      }
    }
  }

  // no available batch – create a new one for virtual registrations
  // For virtual batches, use the database function that handles correct timing
  try {
    const { data: newBatch, error } = await supabase
      .rpc('auto_schedule_batch');
    
    if (error) throw error;
    
    // Update the batch with exam venue from settings
    if (settings.default_exam_venue) {
      await supabase
        .from("mock_batches" as any)
        .update({ exam_venue: settings.default_exam_venue })
        .eq('id', newBatch.id);
      newBatch.exam_venue = settings.default_exam_venue;
    }
    
    return newBatch;
  } catch (error) {
    console.error('Error calling auto_schedule_batch, falling back to client logic:', error);
    // Fall back to client-side logic if database function fails
  }

  // Fallback: client-side batch creation logic
  const now = new Date();
  // Use the already declared batchError if needed, do not redeclare
  const { data: allBatches } = await supabase
    .from("mock_batches" as any)
    .select("*")
    .eq("batch_type", "virtual")
    .neq("title", "Physical Exam Batch")
    .order("exam_date", { ascending: true });

  // Define fixed daily time slots for batches
  const DAILY_TIME_SLOTS = [
    { hour: 12, minute: 0, letter: 'B' }, // 12:00 PM - Batch B  
    { hour: 15, minute: 0, letter: 'C' }  // 3:00 PM - Batch C
  ];

  // Find the current date to check for available slots
  let targetDate: Date;
  let latestDate = allBatches && allBatches.length > 0 ? allBatches[allBatches.length - 1].exam_date : null;
  if (!latestDate) {
    // No batches exist yet, start with April 2, 2026
    targetDate = new Date(now.getFullYear(), 3, 2); // April 2
  } else {
    targetDate = new Date(latestDate);
  }

  // Helper function to compare dates ignoring timezone issues
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Find the next available time slot
  let nextStart: Date | null = null;
  let nextLetter: string = '';

  // Check current target date for available slots
  const { data: allVirtualBatches } = await supabase
    .from("mock_batches" as any)
    .select("*")
    .eq("batch_type", "virtual")
    .neq("title", "Physical Exam Batch");

  // Loop through dates starting from targetDate until we find an available slot
  let currentDate = new Date(targetDate);
  let foundSlot = false;

  while (!foundSlot) {
    // Get batches for current date
    const sameDayBatches = (allVirtualBatches || []).filter((b: any) => {
      if (!b.exam_date) return false;
      const batchDate = new Date(b.exam_date);
      return isSameDay(batchDate, currentDate);
    });

        let latestDate: Date | null = null;
        if (allBatches && allBatches.length > 0) {
          for (const b of allBatches) {
            if (b.exam_date) {
              const d = new Date(b.exam_date);
              if (!latestDate || d > latestDate) latestDate = d;
            }
          }
        }

    // Check each time slot for availability
    for (const slot of DAILY_TIME_SLOTS) {
      if (!usedLetters.includes(slot.letter)) {
        // This slot is available!
        nextStart = new Date(currentDate);
        nextStart.setHours(slot.hour, slot.minute, 0, 0);
        nextLetter = slot.letter;
        foundSlot = true;
        break;
      }
    }

    // If no slots available on this date, move to next day
    if (!foundSlot) {
      currentDate.setDate(currentDate.getDate() + 1);
      console.log(`[DEBUG] No available slots on ${currentDate.toDateString()}, checking next day`);
    }
  }

  console.log(`[DEBUG] Next batch: ${nextLetter} on ${nextStart!.toISOString()}`);

  const title = `Batch ${nextLetter}`;

  const { data: newBatch, error } = await supabase
    .from("mock_batches" as any)
    .insert({ 
      title, 
      exam_date: nextStart!.toISOString(), 
      exam_venue: settings.default_exam_venue || null
    });
  if (error) throw error;
  // If you need to use allVirtualBatches, declare it here:
  // const allVirtualBatches = allBatches;
  return newBatch;
}
