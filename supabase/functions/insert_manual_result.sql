-- Supabase SQL function for manual result entry by admin
-- Call this function with: student_id UUID, subjects JSONB (array of {name, score}), optional time_taken_minutes INT

create or replace function insert_manual_result(
  student_id uuid,
  subjects jsonb,
  time_taken_minutes int default null
)
returns void as $$
declare
  attempt_id uuid;
  subject_breakdown jsonb;
  average float;
  total float := 0;
  count int := 0;
  subj jsonb;
  subj_name text;
  subj_score float;
  subj_grade text;
  breakdown jsonb := '{}'::jsonb;
begin
  -- Calculate average and build breakdown
  for subj in select * from jsonb_array_elements(subjects) loop
    subj_name := subj->>'name';
    subj_score := (subj->>'score')::float;
    total := total + subj_score;
    count := count + 1;
    -- Grade logic
    if subj_score >= 75 then subj_grade := 'A';
    elsif subj_score >= 65 then subj_grade := 'B';
    elsif subj_score >= 50 then subj_grade := 'C';
    elsif subj_score >= 40 then subj_grade := 'D';
    else subj_grade := 'F';
    end if;
    breakdown := breakdown || jsonb_build_object(subj_name, jsonb_build_object('percentage', subj_score, 'grade', subj_grade));
  end loop;
  if count = 0 then average := 0; else average := round(total / count, 2); end if;

  -- Insert attempt
  insert into attempts (user_id, status, submitted_at)
  values (student_id, 'SUBMITTED', now())
  returning id into attempt_id;

  -- Insert result
  insert into results (attempt_id, user_id, subject_breakdown, percentage, time_taken_minutes)
  values (attempt_id, student_id, breakdown, average, time_taken_minutes);
end;
$$ language plpgsql security definer;

-- Usage example:
-- select insert_manual_result(
--   'student-uuid',
--   '[{"name": "Math", "score": 80}, {"name": "English", "score": 65}]'::jsonb,
--   90
-- );
