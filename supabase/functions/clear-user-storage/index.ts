import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClearStorageRequest {
  preserveProfile?: boolean;
}

interface ClearStorageResponse {
  success: boolean;
  message: string;
  clearedFiles: number;
  freedSpace: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { preserveProfile = true }: ClearStorageRequest = req.method === 'POST' 
      ? await req.json() 
      : {};

    console.log(`Starting storage cleanup for user: ${user.id}, preserveProfile: ${preserveProfile}`);

    // Get all user files from storage
    const { data: files, error: listError } = await supabase.storage
      .from('uploads')
      .list(`avatars/${user.id}`, { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      throw new Error(`Failed to list user files: ${listError.message}`);
    }

    let filesToDelete: string[] = [];
    let totalSize = 0;

    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = `avatars/${user.id}/${file.name}`;
        
        // If preserving profile and this looks like a profile picture, skip it
        if (preserveProfile && (
          file.name.includes('avatar') || 
          file.name.includes('profile') ||
          file.metadata?.contentType?.startsWith('image/')
        )) {
          console.log(`Preserving file: ${filePath}`);
          continue;
        }

        filesToDelete.push(filePath);
        totalSize += file.metadata?.size || 0;
      }
    }

    // Also get files from other potential directories
    const otherBuckets = ['resources'];
    for (const bucket of otherBuckets) {
      const { data: bucketFiles, error: bucketError } = await supabase.storage
        .from(bucket)
        .list(`user_${user.id}`, { limit: 1000 });

      if (!bucketError && bucketFiles) {
        for (const file of bucketFiles) {
          const filePath = `user_${user.id}/${file.name}`;
          filesToDelete.push(filePath);
          totalSize += file.metadata?.size || 0;
        }
      }
    }

    let clearedFiles = 0;
    let freedSpace = 0;

    // Delete files in batches
    if (filesToDelete.length > 0) {
      console.log(`Deleting ${filesToDelete.length} files...`);
      
      // Delete from uploads bucket
      const uploadsToDelete = filesToDelete.filter(path => path.startsWith('avatars/'));
      if (uploadsToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('uploads')
          .remove(uploadsToDelete);

        if (deleteError) {
          console.error('Error deleting from uploads:', deleteError);
        } else {
          clearedFiles += uploadsToDelete.length;
        }
      }

      // Delete from resources bucket
      const resourcesToDelete = filesToDelete.filter(path => path.startsWith('user_'));
      if (resourcesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from('resources')
          .remove(resourcesToDelete);

        if (deleteError) {
          console.error('Error deleting from resources:', deleteError);
        } else {
          clearedFiles += resourcesToDelete.length;
        }
      }

      freedSpace = totalSize;
    }

    // Also clear any old exam data, test results, etc. (but keep current user preferences)
    const { error: dataCleanupError } = await supabase
      .from('attempts')
      .delete()
      .eq('user_id', user.id)
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Keep last 30 days

    if (dataCleanupError) {
      console.error('Error cleaning up old attempt data:', dataCleanupError);
    }

    const response: ClearStorageResponse = {
      success: true,
      message: preserveProfile 
        ? `Storage cleared successfully. Profile picture preserved.`
        : `All storage cleared successfully.`,
      clearedFiles,
      freedSpace: Math.round(freedSpace / (1024 * 1024 * 1024) * 1000) / 1000 // Convert to GB
    };

    console.log(`Storage cleanup completed:`, response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in clear-user-storage function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to clear storage'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
