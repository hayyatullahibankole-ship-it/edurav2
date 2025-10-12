-- Guard write-side effects during read-only transactions to prevent PostgREST GET errors
-- 1) log_security_event: skip INSERT when transaction is read-only
create or replace function public.log_security_event(
  event_type text,
  target_table text,
  target_id uuid default null,
  details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Skip on read-only transactions (e.g. PostgREST GET)
  if current_setting('transaction_read_only', true) = 'on' then
    return;
  end if;

  insert into audit_logs (
    action_type,
    actor_user_id,
    target_id,
    target_type,
    details,
    ip_address,
    created_at
  ) values (
    event_type,
    auth.uid(),
    target_id,
    target_table,
    details || jsonb_build_object(
      'timestamp', now(),
      'is_admin', is_admin(auth.uid())
    ),
    inet_client_addr(),
    now()
  );
end;
$$;

-- 2) log_pii_access: skip INSERT when transaction is read-only
create or replace function public.log_pii_access(
  accessed_user_id uuid,
  access_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Skip on read-only transactions
  if current_setting('transaction_read_only', true) = 'on' then
    return;
  end if;

  -- Only log if accessing someone else's data
  if not exists (select 1 from users where id = accessed_user_id and auth_user_id = auth.uid()) then
    insert into audit_logs (
      action_type,
      actor_user_id,
      target_id,
      target_type,
      details,
      ip_address,
      created_at
    ) values (
      'PII_ACCESS',
      auth.uid(),
      accessed_user_id,
      'user',
      jsonb_build_object(
        'access_type', access_type,
        'timestamp', now(),
        'is_admin', is_admin(auth.uid())
      ),
      inet_client_addr(),
      now()
    );
  end if;
end;
$$;

-- 3) log_admin_pii_access: fast return when read-only
create or replace function public.log_admin_pii_access(
  target_user_id uuid,
  access_type text,
  accessed_fields text[] default array[]::text[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_setting('transaction_read_only', true) = 'on' then
    return;
  end if;

  if is_admin(auth.uid()) and target_user_id <> auth.uid() then
    perform log_security_event(
      'ADMIN_PII_ACCESS',
      'user_data',
      target_user_id,
      jsonb_build_object(
        'access_type', access_type,
        'accessed_fields', accessed_fields,
        'admin_user', auth.uid(),
        'ip_address', inet_client_addr()
      )
    );
  end if;
end;
$$;

-- 4) check_rate_limit: do nothing on read-only (safe for GET)
create or replace function public.check_rate_limit(
  endpoint_name text,
  max_requests integer default 100,
  window_minutes integer default 60
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  window_start timestamp with time zone;
begin
  if current_setting('transaction_read_only', true) = 'on' then
    -- In read-only contexts, don't attempt writes and allow the request
    return true;
  end if;

  window_start := now() - (window_minutes || ' minutes')::interval;

  select count(*) into current_count
  from rate_limits
  where user_id = auth.uid()
    and endpoint = endpoint_name
    and created_at >= window_start;

  if current_count >= max_requests then
    perform log_security_event(
      'RATE_LIMIT_EXCEEDED',
      'rate_limit',
      auth.uid(),
      jsonb_build_object(
        'endpoint', endpoint_name,
        'current_count', current_count,
        'max_requests', max_requests
      )
    );
    return false;
  end if;

  insert into rate_limits (user_id, endpoint, request_count, window_start, created_at)
  values (auth.uid(), endpoint_name, 1, window_start, now());

  return true;
end;
$$;

-- 5) validate_admin_action: short-circuit rate-limit/logging on read-only
create or replace function public.validate_admin_action(
  action_type text,
  target_data jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_user_id uuid;
  is_valid_admin boolean;
begin
  admin_user_id := auth.uid();
  select is_admin(admin_user_id) into is_valid_admin;

  if not is_valid_admin then
    perform log_security_event(
      'UNAUTHORIZED_ADMIN_ATTEMPT',
      'admin_validation',
      admin_user_id,
      jsonb_build_object('attempted_action', action_type, 'target_data', target_data, 'ip_address', inet_client_addr())
    );
    return false;
  end if;

  if current_setting('transaction_read_only', true) = 'on' then
    -- Skip rate limit + action log in read-only GETs
    return true;
  end if;

  if not check_rate_limit('admin_action', 100, 60) then
    return false;
  end if;

  perform log_admin_action(action_type, admin_user_id);
  return true;
end;
$$;
