import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const checks = {
      timestamp: new Date().toISOString(),
      database: false,
      cron_jobs: false,
      email_service: false,
      details: {} as Record<string, any>
    };

    // Check database connection
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .limit(1);
      
      checks.database = !error;
      if (error) {
        checks.details.database_error = error.message;
      }
    } catch (error: any) {
      checks.details.database_error = error.message;
    }

    // Check cron jobs status
    try {
      const { data: cronJobs, error } = await supabase.rpc('cron.job_list' as any);
      
      if (!error && cronJobs) {
        checks.cron_jobs = true;
        checks.details.active_cron_jobs = cronJobs.length || 0;
      } else {
        // Fallback: check if cron extension exists
        const { data: extensions } = await supabase
          .from('pg_extension' as any)
          .select('extname')
          .eq('extname', 'pg_cron');
        
        checks.cron_jobs = !!extensions && extensions.length > 0;
        checks.details.cron_extension_installed = checks.cron_jobs;
      }
    } catch (error: any) {
      checks.details.cron_check_error = error.message;
    }

    // Check recent email deliveries
    try {
      const { data: recentEmails, error } = await supabase
        .from('email_delivery_log')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && recentEmails) {
        const successCount = recentEmails.filter((e: any) => e.status === 'sent').length;
        const failedCount = recentEmails.filter((e: any) => e.status === 'failed').length;
        
        checks.email_service = successCount > 0 || failedCount < recentEmails.length;
        checks.details.recent_emails = {
          total: recentEmails.length,
          successful: successCount,
          failed: failedCount,
          success_rate: recentEmails.length > 0 
            ? ((successCount / recentEmails.length) * 100).toFixed(2) + '%'
            : '0%'
        };
      }
    } catch (error: any) {
      checks.details.email_check_error = error.message;
    }

    // Overall health status
    const isHealthy = checks.database && checks.cron_jobs;
    const status = isHealthy ? 200 : 503;

    console.log(`🏥 Health check completed: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`, checks);

    return new Response(
      JSON.stringify({
        status: isHealthy ? 'healthy' : 'unhealthy',
        ...checks
      }),
      {
        status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in health-check function:", error);
    return new Response(
      JSON.stringify({ 
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);