-- Secure search_path for our functions
CREATE OR REPLACE FUNCTION compute_exam_results(attempt_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_id uuid;
    total_questions int := 0;
    correct_count int := 0;
    wrong_count int := 0;
    unanswered_count int := 0;
    attempt_record record;
    question_record record;
    user_answer jsonb;
    correct_answer text;
    percentage numeric;
    subject_breakdown jsonb := '{}';
    subject_stats record;
BEGIN
    SELECT * INTO attempt_record FROM attempts WHERE id = attempt_uuid;
    IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found: %', attempt_uuid; END IF;

    FOR question_record IN 
        SELECT q.id, q.correct_answer, q.subject_id, s.name as subject_name, aa.answer
        FROM attempt_answers aa
        JOIN questions q ON aa.question_id = q.id
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE aa.attempt_id = attempt_uuid
    LOOP
        total_questions := total_questions + 1;
        user_answer := question_record.answer;
        correct_answer := question_record.correct_answer;
        IF user_answer IS NULL THEN
            unanswered_count := unanswered_count + 1;
        ELSE
            IF (user_answer::text = correct_answer) OR 
               (user_answer::text = '"' || correct_answer || '"') OR
               (correct_answer = (user_answer::int)::text) THEN
                correct_count := correct_count + 1;
                UPDATE attempt_answers SET is_correct = true 
                WHERE attempt_id = attempt_uuid AND question_id = question_record.id;
            ELSE
                wrong_count := wrong_count + 1;
                UPDATE attempt_answers SET is_correct = false 
                WHERE attempt_id = attempt_uuid AND question_id = question_record.id;
            END IF;
        END IF;
    END LOOP;

    IF total_questions > 0 THEN
        percentage := (correct_count::numeric / total_questions::numeric) * 100;
    ELSE
        percentage := 0;
    END IF;

    FOR subject_stats IN
        SELECT s.name as subject_name,
               COUNT(*) as total,
               COUNT(CASE WHEN aa.is_correct = true THEN 1 END) as correct,
               COUNT(CASE WHEN aa.is_correct = false THEN 1 END) as wrong,
               COUNT(CASE WHEN aa.answer IS NULL THEN 1 END) as unanswered
        FROM attempt_answers aa
        JOIN questions q ON aa.question_id = q.id
        LEFT JOIN subjects s ON q.subject_id = s.id
        WHERE aa.attempt_id = attempt_uuid
        GROUP BY s.id, s.name
    LOOP
        subject_breakdown := subject_breakdown || jsonb_build_object(
            subject_stats.subject_name,
            jsonb_build_object(
                'total', subject_stats.total,
                'correct', subject_stats.correct,
                'wrong', subject_stats.wrong,
                'unanswered', subject_stats.unanswered,
                'percentage', CASE WHEN subject_stats.total > 0 THEN ROUND((subject_stats.correct::numeric / subject_stats.total::numeric) * 100, 2) ELSE 0 END
            )
        );
    END LOOP;

    INSERT INTO results (
        attempt_id, raw_score, percentage, subject_breakdown, total_questions,
        correct_answers, wrong_answers, unanswered, auto_graded
    ) VALUES (
        attempt_uuid, correct_count, percentage, subject_breakdown, total_questions,
        correct_count, wrong_count, unanswered_count, true
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

CREATE OR REPLACE FUNCTION recompute_results_for_attempt(attempt_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid;
  allowed boolean;
  new_result_id uuid;
BEGIN
  caller := auth.uid();
  IF caller IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT EXISTS (
    SELECT 1 FROM attempts a JOIN users u ON a.user_id = u.id
    WHERE a.id = attempt_uuid AND u.auth_user_id = caller
  ) INTO allowed;

  IF NOT allowed THEN RAISE EXCEPTION 'Not authorized to recompute this attempt'; END IF;

  new_result_id := compute_exam_results(attempt_uuid);
  RETURN new_result_id;
END;
$$;
