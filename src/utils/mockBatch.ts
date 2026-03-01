import type { SupabaseClient } from '@supabase/supabase-js';

// Helper to find an active batch with available capacity (30 students) or create a
// new one automatically. This mirrors the logic previously inline in
// AkboyMockRegistration, but extracted so that schools and single users can
// reuse it.
export async function getOrCreateBatch(supabase: SupabaseClient, settings: any) {
  // constants used for scheduling
  const BATCH_CAPACITY = 30;
  const SLOTS_PER_DAY = 3;
  const SLOT_DURATION_MIN = 150; // 2h30
  const BREAK_MIN = 30;

  // fetch active batches sorted by exam_date ascending
  const { data: activeBatches } = await supabase
    .from("mock_batches" as any)
    .select("*")
    .eq("is_active", true)
    .order("exam_date", { ascending: true });

  // look for an existing batch with room
  if (activeBatches && activeBatches.length > 0) {
    for (const b of activeBatches) {
      if (!b.id) continue;
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

  // no available batch – create a new one
  const now = new Date();
  const year = now.getFullYear();
  const defaultStart = new Date(year, 3, 2, 9, 0, 0); // april 2 at 9am

  // determine latest exam_date among existing batches
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
    nextStart = defaultStart;
  } else {
    const sameDayBatches = (activeBatches || []).filter(
      (b: any) => b.exam_date && new Date(b.exam_date).toDateString() === latestDate!.toDateString()
    );
    if (sameDayBatches.length < SLOTS_PER_DAY) {
      nextStart = new Date(latestDate.getTime() + (SLOT_DURATION_MIN + BREAK_MIN) * 60 * 1000);
    } else {
      nextStart = new Date(latestDate);
      nextStart.setDate(nextStart.getDate() + 1);
      nextStart.setHours(9, 0, 0, 0);
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
