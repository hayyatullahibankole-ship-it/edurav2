import { createClient } from '@supabase/supabase-js';
const url = 'https://zqapbmllkywsuywpfava.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXBibWxsa3l3c3V5dH...';
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
(async () => {
  const codes = await supabase.from('ebook_access_codes').select('id,code,max_uses,used_count,is_active,expires_at,ebook_id').limit(50);
  console.log('CODES', JSON.stringify(codes, null, 2));
  const rpc = await supabase.rpc('redeem_ebook_code_for_device', { _code: 'TEST', _fingerprint: 'FP' });
  console.log('RPC', JSON.stringify(rpc, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
