import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Default fallback OG images
const DEFAULT_OG_IMAGE_EDURA =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/C2jPY39C9WbPmlBUAbXZbDdi8p83/social-images/social-1759746865681-edura%20logo.jpg";
const DEFAULT_OG_IMAGE_AKBOY =
  "https://zqapbmllkywsuywpfava.supabase.co/storage/v1/object/public/resources/akboy-logo.png";

function isUUID(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug")?.trim();
    const target = url.searchParams.get("target")?.trim() || ""; // canonical/og:url

    if (!slug) {
      return new Response("Missing slug", { status: 400, headers: corsHeaders });
    }

    console.log("[blog-share] fetching post for:", slug);

    // Fetch post by slug or id, only if published
    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, featured_image_url, published_at, is_published")
      .eq("is_published", true)
      .limit(1);

    query = isUUID(slug) ? query.eq("id", slug) : query.eq("slug", slug);

    const { data: post, error } = await query.maybeSingle();

    if (error) {
      console.error("[blog-share] DB error:", error);
    }

    // Detect platform from target URL or referer
    const referer = req.headers.get("referer") || "";
    const isAkboy = target?.includes("akboy") || referer.includes("akboy");
    
    const siteName = isAkboy ? "AKBOY Creative Hub" : "Edura";
    const defaultDescription = isAkboy 
      ? "Latest insights on design, education and technology from AKBOY." 
      : "Latest admission news, updates and study tips from Edura.";
    const defaultOgImage = isAkboy ? DEFAULT_OG_IMAGE_AKBOY : DEFAULT_OG_IMAGE_EDURA;
    const baseDomain = isAkboy ? "https://akboy.space" : "https://edura.app";
    
    const title = post?.title ? `${post.title} | ${siteName} Blog` : `${siteName} Blog`;
    const description = post?.excerpt || defaultDescription;
    const image = (post?.featured_image_url && post.featured_image_url.startsWith("http"))
      ? post.featured_image_url
      : defaultOgImage;

    const pageUrl = target || (post?.slug ? `${baseDomain}/blog/${post.slug}` : `${baseDomain}/blog`);

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="${escapeHtml(siteName)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  ${target ? `<link rel="canonical" href="${escapeHtml(pageUrl)}" />` : ""}
  ${target ? `<meta http-equiv="refresh" content="0; url=${escapeHtml(pageUrl)}" />` : ""}
  <meta name="robots" content="index, follow" />
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;text-align:center}</style>
  ${target ? `<script>window.location.replace("${escapeHtml(pageUrl)}");</script>` : ""}
</head>
<body>
  <h1>${escapeHtml(post?.title || `${siteName} Blog`)}</h1>
  <p>Redirecting to the article...</p>
  <p><a href="${escapeHtml(pageUrl)}">Click here if not redirected</a></p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err: any) {
    console.error("[blog-share] Unhandled error:", err);
    return new Response("Internal Server Error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
