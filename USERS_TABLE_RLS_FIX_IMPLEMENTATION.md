# Users Table RLS Security Fix - Implementation Guide

## Overview

This guide explains how to implement the critical security fixes for the `users` table Row Level Security (RLS) policies. These fixes address vulnerabilities that could expose personally identifiable information (PII), authentication secrets, and session tokens.

## Files Generated

1. **USERS_TABLE_RLS_SECURITY_AUDIT.md** - Comprehensive security audit report
2. **supabase/migrations/20260215_users_table_rls_security_fixes.sql** - Migration with all fixes
3. **USERS_TABLE_RLS_FIX_IMPLEMENTATION.md** - This implementation guide

## Critical Issues Being Fixed

### 1. **2FA Secrets in Plaintext** (CRITICAL)
- **Issue**: `two_fa_secret` stored in plaintext database
- **Risk**: If database is breached, all 2FA secrets exposed
- **Fix**: Column protection via UPDATE trigger + recommendation to use Supabase Auth instead

### 2. **Session Tokens in Plaintext** (CRITICAL)
- **Issue**: `active_session_token` stored unencrypted
- **Risk**: Database breach = immediate account takeovers
- **Fix**: Column protection + strong recommendation to hash and encrypt

### 3. **Missing Security Functions** (CRITICAL)
- **Issue**: Code references `log_security_event()` which doesn't exist
- **Risk**: RLS policies may fail silently
- **Fix**: Create the missing function and all helper functions

### 4. **Weak INSERT Policy** (CRITICAL)
- **Issue**: Current policy allows super_admin to bypass system-only rule
- **Risk**: Unauthorized user creation
- **Fix**: Restrict INSERT to service_role only

### 5. **Missing Column-Level RLS** (HIGH)
- **Issue**: Users can read all columns including sensitive fields
- **Risk**: PII exposure to other users
- **Fix**: Implement column restrictions and masked views

## Pre-Implementation Checklist

- [ ] **Backup Database**: Take full backup before applying migration
  ```bash
  supabase db pull  # Pull current schema
  ```

- [ ] **Review Affected Applications**: Check all code querying users table
  - [ ] Admin consoles accessing user data
  - [ ] Profile endpoints
  - [ ] User management pages
  - [ ] Reports/analytics using user data

- [ ] **Identify Breaking Changes**: Code using direct SELECT will fail
  - [ ] User profile retrieval code
  - [ ] Admin user list views
  - [ ] User search functionality
  - [ ] User update operations

- [ ] **Test Environment**: Apply migration to staging first
  - [ ] Database: staging/development
  - [ ] Applications: point to staging
  - [ ] Test suite: comprehensive testing

- [ ] **Stakeholder Notification**: Inform teams of changes
  - [ ] DevOps team
  - [ ] Backend developers
  - [ ] Frontend developers
  - [ ] QA team

## Implementation Steps

### Phase 1: Preparation (30 minutes)

#### Step 1.1: Create Database Backup
```bash
# Using Supabase CLI
supabase db pull --schema-only > backup_schema_$(date +%s).sql
supabase db push --dry-run

# Or via SQL backup
pg_dump --no-owner --no-privileges > users_table_backup.sql
```

#### Step 1.2: Document Current State
```sql
-- Run in your current database to document existing RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
SELECT routine_name FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name LIKE '%pii%' OR routine_name LIKE '%log%';
```

#### Step 1.3: Review Application Code
Search your codebase for:
```bash
# Find all queries to users table
grep -r "FROM users" src/ lib/ pages/
grep -r "SELECT.*users" src/
grep -r "UPDATE users" src/
grep -r ".users\." src/
```

Document all affected query patterns.

### Phase 2: Apply Migration to Development (1 hour)

#### Step 2.1: Deploy to Development
```bash
# Copy migration file
cp supabase/migrations/20260215_users_table_rls_security_fixes.sql supabase/migrations/

# Apply locally
supabase db push

# Or manually via connection
psql postgres://user:password@localhost:5432/database \
  -f supabase/migrations/20260215_users_table_rls_security_fixes.sql
```

#### Step 2.2: Verify Migration Success
```sql
-- Check all functions created successfully
SELECT routine_name, routine_schema 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_name LIKE '%log_%' OR routine_name LIKE '%get_user%' OR routine_name LIKE '%prevent%');

-- Check views created
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'VIEW' 
AND table_name LIKE 'users%';

-- Check policies remain intact
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Check metadata populated
SELECT table_name, column_name, sensitivity 
FROM public.pii_field_metadata;
```

#### Step 2.3: Run Security Tests
```sql
-- Test 1: Verify RLS policies are enforced
-- As authenticated user (not super_admin):
SELECT email FROM users WHERE id != auth.uid() LIMIT 1;
-- Expected: ERROR - new policy should block

-- Test 2: Check masked view works
SELECT * FROM public.users_internal_masked 
WHERE id = auth.uid();
-- Expected: Email and phone should be masked

-- Test 3: Verify secure functions work
SELECT * FROM public.get_user_profile_full(auth.uid());
-- Expected: Full profile data

-- Test 4: Check audit logging
SELECT * FROM public.audit_logs 
WHERE target_type = 'users' 
ORDER BY created_at DESC LIMIT 10;
-- Expected: Recent access logs
```

### Phase 3: Update Application Code (2-4 hours)

#### Step 3.1: Identify Query Patterns to Update

| Pattern | Old Code | New Code | Impact |
|---------|----------|----------|--------|
| Get user profile | `SELECT * FROM users WHERE id = $1` | `SELECT * FROM get_user_profile_full($1)` | Authentication required |
| List users (admin) | `SELECT * FROM users LIMIT 10` | `SELECT * FROM users_internal_masked LIMIT 10` | Only masked data returned |
| Update profile | `UPDATE users SET ... WHERE id = $1` | `SELECT update_user_profile_safe(...)` | Function-based update |
| Check user exists | `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)` | `SELECT EXISTS(SELECT 1 FROM (SELECT email FROM users_public_profile) WHERE email = $1)` | Public view only |

#### Step 3.2: Migration Examples

**Example 1: User Profile Retrieval**
```typescript
// BEFORE (breaks with new RLS)
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

// AFTER (works with new RLS)
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_profile_full', { target_user_id: userId });
  return data?.[0];
}
```

**Example 2: User Profile Update**
```typescript
// BEFORE (direct update - blocked by new RLS)
export async function updateProfile(updates: any) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select();
  return data;
}

// AFTER (use secure function)
export async function updateProfile(updates: any) {
  const { data, error } = await supabase
    .rpc('update_user_profile_safe', {
      p_first_name: updates.firstName,
      p_last_name: updates.lastName,
      p_phone: updates.phone,
      p_address: updates.address,
      p_state: updates.state,
      p_country: updates.country,
      p_profile_image_url: updates.profileImageUrl
    });
  return data?.[0];
}
```

**Example 3: Admin User List**
```typescript
// BEFORE (direct access - now shows masked data)
export async function listUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(50);
  return data;
}

// AFTER (explicit masked view - same result but clearer)
export async function listUsers() {
  const { data, error } = await supabase
    .from('users_internal_masked')
    .select('*')
    .limit(50);
  return data;
}
```

**Example 4: Check User Exists**
```typescript
// BEFORE (works but queries full record)
export async function userEmailExists(email: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .limit(1);
  return data?.length > 0;
}

// AFTER (only checks public data - may return false even if email exists for privacy)
// Note: You should not rely on email existence check externally due to privacy
// Consider using a different approach (check during signup only via auth.users)
```

#### Step 3.3: Test Each Change

```typescript
// Example test suite
describe('User API with new RLS', () => {
  it('should retrieve own user profile', async () => {
    const profile = await getUser(currentUserId);
    expect(profile).toBeDefined();
    expect(profile.email).toBeDefined(); // Own email visible
  });

  it('should not retrieve other users profile directly', async () => {
    try {
      await getUser(otherId);
      fail('Should have failed');
    } catch (e) {
      expect(e.message).toContain('permission denied');
    }
  });

  it('should update own profile safely', async () => {
    const result = await updateProfile({ 
      firstName: 'New Name' 
    });
    expect(result.success).toBe(true);
  });

  it('admin should see masked user list', async () => {
    const users = await listUsers();
    users.forEach(u => {
      expect(u.email).toMatch(/^\*\*\*@/); // Masked email
    });
  });
});
```

### Phase 4: Testing (2-3 hours)

#### Step 4.1: Security Testing

```sql
-- Test RLS prevents unauthorized access
-- Connect as normal user (not super_admin)
\c database_name app_user

-- Should fail - cannot access other user's full data
SELECT email, phone, address FROM users WHERE id != auth.uid();

-- Should work but return masked data
SELECT email FROM users_internal_masked WHERE id != auth.uid();

-- Should work - own data
SELECT * FROM get_user_profile_full(auth.uid());

-- Should fail if trying to modify 2FA secret
UPDATE users SET two_fa_secret = 'malicious' WHERE id = auth.uid();
```

#### Step 4.2: Functionality Testing

- [ ] **Profile View**: User can view own profile
- [ ] **Profile Edit**: User can edit allowed fields only
- [ ] **Admin Access**: Admin can view masked user list
- [ ] **Admin Edit**: Admin can edit user fields (validation works)
- [ ] **Audit Logs**: Access is logged appropriately
- [ ] **Error Handling**: Proper errors returned for unauthorized access

#### Step 4.3: Performance Testing

```sql
-- Check index performance
EXPLAIN ANALYZE SELECT * FROM users WHERE auth_user_id = auth.uid();

-- Monitor query performance
SELECT 
  query,
  calls,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%users%'
ORDER BY mean_time DESC;
```

### Phase 5: Staging Deployment (30 minutes)

#### Step 5.1: Deploy to Staging
```bash
# Use Supabase CLI to push to staging database
supabase --project-ref=staging-project db push

# Or connect to staging database directly
PGHOST=staging-db.supabase.co psql -U postgres \
  -f supabase/migrations/20260215_users_table_rls_security_fixes.sql
```

#### Step 5.2: Run Full Integration Tests
```bash
# Point to staging database
SUPABASE_URL=https://staging.supabase.co npm test

# Run security tests
npm run test:security

# Run load tests
npm run test:load
```

#### Step 5.3: Monitor Logs
```bash
# Check for errors
supabase logs pull --follow

# Monitor slow queries
supabase logs pull --follow --filter="duration > 1000"
```

### Phase 6: Production Deployment (1 hour)

#### Step 6.1: Pre-Production Check
- [ ] All staging tests passing
- [ ] All code changes merged and reviewed
- [ ] Rollback plan documented
- [ ] Team notified of maintenance window (if needed)
- [ ] Monitoring alerts configured

#### Step 6.2: Deploy Migration
```bash
# Deploy to production
supabase --project-ref=production-project db push

# Or via direct connection (with backup)
supabase db pull --schema-only > production_backup_$(date +%s).sql
PGHOST=prod-db.supabase.co psql -U postgres \
  -f supabase/migrations/20260215_users_table_rls_security_fixes.sql
```

#### Step 6.3: Deploy Application Code
```bash
# After migration succeeds, deploy updated application
git tag production-release-$(date +%s)
git push --tags
# Deploy via your CI/CD pipeline
```

#### Step 6.4: Post-Deployment Verification
```sql
-- Verify migration applied correctly
SELECT COUNT(*) FROM pg_proc 
WHERE proname LIKE '%get_user%' AND pronamespace = 'public'::regnamespace;
-- Expected: > 0

-- Check for errors
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%error%' 
ORDER BY calls DESC LIMIT 10;

-- Monitor connections
SELECT datname, count(*) FROM pg_stat_activity 
GROUP BY datname;
```

## Rollback Plan

If issues occur, here's how to rollback:

### Option 1: Unapply Migration (Quick)
```bash
# Using Supabase CLI
supabase db push --dry-run --ignore-migration-spacing

# Or drop the elements created (in reverse order)
DROP TRIGGER IF EXISTS prevent_sensitive_fields_update ON public.users;
DROP FUNCTION IF EXISTS public.prevent_sensitive_field_modification();
DROP FUNCTION IF EXISTS public.update_user_profile_safe(...);
DROP FUNCTION IF EXISTS public.get_user_profile_full(uuid);
DROP FUNCTION IF EXISTS public.log_security_event(...);
DROP VIEW IF EXISTS public.users_internal_masked;
DROP VIEW IF EXISTS public.users_public_profile;
DROP TABLE IF EXISTS public.pii_field_metadata;
DROP TABLE IF EXISTS public.security_notes;

-- Recreate old policies (from backup)
```

### Option 2: Database Restore (Safest)
```bash
# Restore from backup
pg_restore --no-owner --no-privileges production_backup_*.sql

# Or use Supabase point-in-time recovery
# (configured in Supabase dashboard)
```

### Option 3: Revert Application Code
```bash
# Revert to previous application version
git checkout HEAD~1
npm install
deploy()
```

## Monitoring After Deployment

### 1. **Error Tracking**
Monitor for RLS-related errors:
```
- "permission denied for"
- "violates row level security"
- "Insufficient permissions"
```

### 2. **Performance Metrics**
```sql
-- Monitor query performance changes
SELECT 
  query,
  calls,
  mean_time as avg_ms,
  max_time as max_ms
FROM pg_stat_statements
WHERE query LIKE '%users%'
ORDER BY mean_time DESC;
```

### 3. **Audit Log Monitoring**
```sql
-- Check for suspicious patterns
SELECT 
  actor_user_id,
  action_type,
  COUNT(*) as count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY actor_user_id, action_type
HAVING COUNT(*) > 100;  -- Alert threshold
```

## Documentation for Developers

### Using the Secure Functions

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// 1. Get user profile (with full PII if own user or admin)
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_profile_full', {
      target_user_id: userId
    }, { count: 'exact' });

  if (error?.code === '42501') {
    // Insufficient permissions
    console.error('Cannot access this user\'s profile');
  }
  return data?.[0];
}

// 2. Update user profile (safe - only allowed fields)
export async function updateUserProfile(updates: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  state?: string;
  country?: string;
  profileImageUrl?: string;
}) {
  const { data, error } = await supabase
    .rpc('update_user_profile_safe', {
      p_first_name: updates.firstName,
      p_last_name: updates.lastName,
      p_phone: updates.phone,
      p_address: updates.address,
      p_state: updates.state,
      p_country: updates.country,
      p_profile_image_url: updates.profileImageUrl
    });

  if (error) {
    console.error('Profile update failed:', error);
    return null;
  }

  return data?.[0];
}

// 3. Get masked user list (for admin interfaces)
export async function getAdminUserList(limit = 50) {
  const { data, error } = await supabase
    .from('users_internal_masked')
    .select('*')
    .limit(limit);

  return data || [];
}

// 4. Get public user profile (basic info only)
export async function getPublicUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users_public_profile')
    .select('*')
    .eq('id', userId)
    .single();

  return data;
}
```

## FAQ

### Q: Why can't users see other users' email addresses anymore?
**A:** This is intentional for privacy protection. Users should only see basic profile information (name, profile picture) unless they have a specific relationship (admin, etc.).

### Q: Will this break my existing API endpoints?
**A:** Possibly. Any endpoint making direct SELECT queries to the users table will be affected. Review your code and test thoroughly.

### Q: How do I know if RLS is working?
**A:** Try to query `SELECT * FROM users WHERE id != auth.uid();` as a regular user. You should get a permission denied error.

### Q: Can I disable these restrictions?
**A:** It's not recommended, but you could remove policies as super_admin. However, doing so would restore the security vulnerabilities.

### Q: How do I view audit logs?
**A:** Only super_admins can query the audit_logs table:
```sql
SELECT * FROM audit_logs 
WHERE target_type = 'users' 
ORDER BY created_at DESC 
LIMIT 100;
```

### Q: What about 2FA secrets and session tokens?
**A:** The migration protects these columns but doesn't solve the fundamental issue of storing them in plaintext. **Strongly recommended**:
1. Remove `two_fa_secret` column and use Supabase Auth's built-in 2FA
2. Hash and encrypt `active_session_token` before storage
3. Implement token expiration
4. Use secure cookie-based sessions

## Support & Escalation

### Known Issues
- None (updated as issues are discovered)

### Getting Help
1. Review USERS_TABLE_RLS_SECURITY_AUDIT.md
2. Check test results in Monitoring section
3. Review application logs for RLS-related errors
4. Contact security team if violations detected

### Reporting Issues
- Create issue with: Migration version, error message, affected code
- Include: Steps to reproduce, database logs, error frequency

## Sign-Off

After successful deployment:

- [ ] Dev Lead: Code review approved
- [ ] DevOps: Deployment successful and verified  
- [ ] QA: Testing complete and passed
- [ ] Security: Security audit passed
- [ ] Product: No breaking changes to critical features

---

**Migration Version**: 20260215  
**Created**: 2026-02-15  
**Last Updated**: 2026-02-15
