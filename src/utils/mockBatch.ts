import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to find an active batch with available capacity (30 students) or create a
// new one automatically. This mirrors the logic previously inline in
// AkboyMockRegistration, but extracted so that schools and single users can
// reuse it.
export async function getOrCreateBatch(supabase: SupabaseClient, settings: any, registrationMode: string = 'virtual') {
  // constants used for scheduling
  const BATCH_CAPACITY = 30;
  const BATCH_INTERVAL_HOURS = 3; // 3-hour interval between batches
  const BATCH_DURATION_MIN = 150; // 2.5 hours (150 minutes)
  const DAILY_START_HOUR = 9; // 9:00 AM
  const DAILY_END_HOUR = 18; // 6:00 PM (18:00 in 24-hour format)

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
        is_active: true
      } as any)
      .select()
      .single();
    
    if (error) throw error;
    return newPhysicalBatch;
  }

  // fetch active batches sorted by exam_date ascending (for virtual registrations)
  const { data: activeBatches } = await supabase
    .from("mock_batches" as any)
    .select("*")
    .neq("title", "Physical Exam Batch")
    .eq("is_active", true)
    .order("exam_date", { ascending: true });

  // look for an existing batch with room
  if (activeBatches && activeBatches.length > 0) {
    for (const b of activeBatches) {
      if (!b.id) continue;
      // Count ALL registrations in this batch (virtual + physical) to check total capacity
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
  const now = new Date();
  const year = now.getFullYear();
  const defaultStart = new Date(year, 3, 2, 9, 0, 0); // april 2 at 9am

  // determine latest exam_date among existing batches (excluding physical batch)
  let latestDate: Date | null = null;
  if (activeBatches && activeBatches.length > 0) {
    for (const b of activeBatches) {
      if (b.exam_date) {
        const d = new Date(b.exam_date);
        if (!latestDate || d > latestDate) latestDate = d;
      }
    }
  }

  let nextStart: Date;
  if (!latestDate) {
    nextStart = new Date(now.getFullYear(), 3, 2, DAILY_START_HOUR, 0, 0); // april 2 at 9am
  } else {
    // Calculate next batch start time (3 hours after the latest batch start)
    const potentialNextStart = new Date(latestDate.getTime() + BATCH_INTERVAL_HOURS * 60 * 60 * 1000);
    
    // Calculate when this batch would end
    const potentialEndTime = new Date(potentialNextStart.getTime() + BATCH_DURATION_MIN * 60 * 1000);
    
    // Check if the batch would end after 6:00 PM
    if (potentialEndTime.getHours() > DAILY_END_HOUR || 
        (potentialEndTime.getHours() === DAILY_END_HOUR && potentialEndTime.getMinutes() > 0)) {
      // Schedule for next day at 9:00 AM
      nextStart = new Date(potentialNextStart);
      nextStart.setDate(nextStart.getDate() + 1);
      nextStart.setHours(DAILY_START_HOUR, 0, 0, 0);
    } else {
      nextStart = potentialNextStart;
    }
  }

  const totalBatches = (activeBatches || []).length;
  const batchLetter = String.fromCharCode(65 + totalBatches); // A, B, C...
  const title = `Batch ${batchLetter}`;

  const { data: newBatch, error } = await supabase
    .from("mock_batches" as any)
    .insert({ title, exam_date: nextStart.toISOString(), exam_venue: settings.default_exam_venue || null } as any)
    .select()
    .single();

  if (error) throw error;
  return newBatch;
}
