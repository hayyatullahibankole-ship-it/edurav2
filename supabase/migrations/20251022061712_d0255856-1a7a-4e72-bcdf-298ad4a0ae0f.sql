-- Recreate compute_exam_results to accurately compute total and unanswered across modes
DROP FUNCTION IF EXISTS compute_exam_results(uuid);

CREATE OR REPLACE FUNCTION compute_exam_results(attempt_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result_id uuid;
  expected_total_questions int := 0;
  answered_questions int := 0;
  correct_count int := 0;
  wrong_count int := 0;
  unanswered_count int := 0;
  attempt_record record;
  user_answer jsonb;
  correct_answer text;
  percentage numeric := 0;
  subject_breakdown jsonb := '{}';
  per_subj_total int := 0;
BEGIN
  -- Load attempt with exam details
  SELECT a.*, e.total_questions AS exam_total_questions
  INTO attempt_record
  FROM attempts a
  LEFT JOIN exams e ON e.id = a.exam_id
  WHERE a.id = attempt_uuid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt not found: %', attempt_uuid;
  END IF;

  -- Derive expected total questions
  expected_total_questions := COALESCE(
    attempt_record.exam_total_questions,
    -- Practice config: number of subjects × question_count_per_subject
    CASE 
      WHEN attempt_record.proctoring_data ? 'question_count_per_subject' 
           AND attempt_record.selected_subjects IS NOT NULL THEN 
        (attempt_record.proctoring_data->>'question_count_per_subject')::int 
        * COALESCE(jsonb_array_length(attempt_record.selected_subjects), 0)
      ELSE NULL
    END,
    -- Fallbacks
    (attempt_record.proctoring_data->>'total_questions')::int,
    (attempt_record.proctoring_data->>'question_count')::int,
    0
  );

  -- Iterate answers to compute correct/wrong and set is_correct flags
  FOR user_answer, correct_answer IN
    SELECT aa.answer, q.correct_answer
    FROM attempt_answers aa
    JOIN questions q ON q.id = aa.question_id
    WHERE aa.attempt_id = attempt_uuid
  LOOP
    answered_questions := answered_questions + 1;

    IF user_answer IS NULL THEN
      -- Keep for safety; should not happen with current app flow
      CONTINUE;
    END IF;

    IF (user_answer::text = correct_answer) OR 
       (user_answer::text = '"' || correct_answer || '"') OR
       (correct_answer = (user_answer::int)::text) THEN
      correct_count := correct_count + 1;
    ELSE
      wrong_count := wrong_count + 1;
    END IF;
  END LOOP;

  -- Update is_correct flags in a single statement for performance
  UPDATE attempt_answers aa
  SET is_correct = CASE 
    WHEN aa.answer IS NULL THEN NULL
    ELSE (
      CASE 
        WHEN aa.answer::text = q.correct_answer OR 
             aa.answer::text = '"' || q.correct_answer || '"' OR
             q.correct_answer = (aa.answer::int)::text
        THEN true ELSE false
      END
    )
  END
  FROM questions q
  WHERE aa.question_id = q.id AND aa.attempt_id = attempt_uuid;

  -- Compute unanswered using expected total when available
  IF expected_total_questions > 0 THEN
    unanswered_count := GREATEST(expected_total_questions - answered_questions, 0);
  ELSE
    unanswered_count := 0; -- Unknown total; treat as zero to avoid negatives
  END IF;

  -- Percentage uses expected total if known, else answered count
  IF expected_total_questions > 0 THEN
    percentage := (correct_count::numeric / expected_total_questions::numeric) * 100;
  ELSIF answered_questions > 0 THEN
    percentage := (correct_count::numeric / answered_questions::numeric) * 100;
    expected_total_questions := answered_questions; -- reflect known attempted size
  ELSE
    percentage := 0;
  END IF;

  -- Build subject breakdown
  -- Determine per-subject expected total
  per_subj_total := COALESCE((attempt_record.proctoring_data->>'question_count_per_subject')::int, NULL);

  -- Practice mode with selected_subjects: ensure each selected subject appears in breakdown
  IF per_subj_total IS NOT NULL AND attempt_record.selected_subjects IS NOT NULL THEN
    FOR subject_breakdown IN 
      WITH subj_list AS (
        SELECT (jsonb_array_elements_text(attempt_record.selected_subjects))::uuid AS subject_id
      ),
      answered AS (
        SELECT q.subject_id,
               COUNT(*) AS answered_total,
               COUNT(*) FILTER (WHERE aa.is_correct = true) AS correct,
               COUNT(*) FILTER (WHERE aa.is_correct = false) AS wrong
        FROM attempt_answers aa
        JOIN questions q ON q.id = aa.question_id
        WHERE aa.attempt_id = attempt_uuid
        GROUP BY q.subject_id
      )
      SELECT s.name AS subject_name,
             per_subj_total AS total,
             COALESCE(a.correct, 0) AS correct,
             COALESCE(a.wrong, 0) AS wrong,
             GREATEST(per_subj_total - COALESCE(a.answered_total, 0), 0) AS unanswered
      FROM subj_list sl
      LEFT JOIN subjects s ON s.id = sl.subject_id
      LEFT JOIN answered a ON a.subject_id = sl.subject_id
    LOOP
      subject_breakdown := subject_breakdown || jsonb_build_object(
        subject_breakdown.subject_name,
        jsonb_build_object(
          'total', subject_breakdown.total,
          'correct', subject_breakdown.correct,
          'wrong', subject_breakdown.wrong,
          'unanswered', subject_breakdown.unanswered,
          'percentage', CASE WHEN subject_breakdown.total > 0 THEN ROUND((subject_breakdown.correct::numeric / subject_breakdown.total::numeric) * 100, 2) ELSE 0 END
        )
      );
    END LOOP;
  ELSE
    -- Exam mode (or fallback): use what was answered per subject; totals reflect answered count
    FOR subject_breakdown IN
      SELECT 
        COALESCE(s.name, 'Unknown') AS subject_name,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE aa.is_correct = true) AS correct,
        COUNT(*) FILTER (WHERE aa.is_correct = false) AS wrong,
        COUNT(*) FILTER (WHERE aa.answer IS NULL) AS unanswered
      FROM attempt_answers aa
      JOIN questions q ON q.id = aa.question_id
      LEFT JOIN subjects s ON q.subject_id = s.id
      WHERE aa.attempt_id = attempt_uuid
      GROUP BY s.id, s.name
    LOOP
      subject_breakdown := subject_breakdown || jsonb_build_object(
        subject_breakdown.subject_name,
        jsonb_build_object(
          'total', subject_breakdown.total,
          'correct', subject_breakdown.correct,
          'wrong', subject_breakdown.wrong,
          'unanswered', subject_breakdown.unanswered,
          'percentage', CASE WHEN subject_breakdown.total > 0 THEN ROUND((subject_breakdown.correct::numeric / subject_breakdown.total::numeric) * 100, 2) ELSE 0 END
        )
      );
    END LOOP;
  END IF;

  -- Upsert into results
  INSERT INTO results (
    attempt_id,
    raw_score,
    percentage,
    subject_breakdown,
    total_questions,
    correct_answers,
    wrong_answers,
    unanswered,
    auto_graded
  ) VALUES (
    attempt_uuid,
    correct_count,
    percentage,
    subject_breakdown,
    expected_total_questions,
    correct_count,
    wrong_count,
    unanswered_count,
    true
  )
  ON CONFLICT (attempt_id) DO UPDATE SET
    raw_score = EXCLUDED.raw_score,
    percentage = EXCLUDED.percentage,
    subject_breakdown = EXCLUDED.subject_breakdown,
    total_questions = EXCLUDED.total_questions,
    correct_answers = EXCLUDED.correct_answers,
    wrong_answers = EXCLUDED.wrong_answers,
    unanswered = EXCLUDED.unanswered,
    auto_graded = EXCLUDED.auto_graded,
    graded_at = NOW()
  RETURNING id INTO result_id;

  RETURN result_id;
END;
$$;