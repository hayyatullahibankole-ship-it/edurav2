-- Ensure public bucket for school logos and appropriate policies
-- Create bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('school-logos', 'school-logos', true)
on conflict (id) do nothing;

-- Public can view logos
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read school logos'
  ) then
    create policy "Public read school logos"
      on storage.objects
      for select
      using (bucket_id = 'school-logos');
  end if;
end $$;

-- Allow authenticated users to insert/update/delete within the school-logos bucket
-- Insert
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated insert school logos'
  ) then
    create policy "Authenticated insert school logos"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'school-logos');
  end if;
end $$;

-- Update
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated update school logos'
  ) then
    create policy "Authenticated update school logos"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'school-logos')
      with check (bucket_id = 'school-logos');
  end if;
end $$;

-- Delete
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated delete school logos'
  ) then
    create policy "Authenticated delete school logos"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'school-logos');
  end if;
end $$;

-- Ensure school admins can update their own school row (so logo_url can be saved)
-- Enable RLS on schools table
alter table if exists public.schools enable row level security;

-- View policy
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'schools' and policyname = 'School admins can view own school'
  ) then
    create policy "School admins can view own school"
      on public.schools
      for select
      using (is_school_admin(auth.uid(), id));
  end if;
end $$;

-- Update policy
do $$ begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'schools' and policyname = 'School admins can update own school'
  ) then
    create policy "School admins can update own school"
      on public.schools
      for update
      using (is_school_admin(auth.uid(), id))
      with check (is_school_admin(auth.uid(), id));
  end if;
end $$;