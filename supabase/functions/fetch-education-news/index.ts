import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Nigerian education-focused RSS feeds - only those with good content and images
const NEWS_SOURCES = [
  {
    name: "Campus Info",
    url: "https://campusinfo.com.ng/feed/",
    category: "Admissions",
    isRSS: true,
  },
  {
    name: "Nigerian Scholars",
    url: "https://nigerianscholars.com/feed/",
    category: "Schools & Admissions",
    isRSS: true,
  },
  {
    name: "MySchoolGist",
    url: "https://myschool.ng/news/feed/",
    category: "Education News",
    isRSS: true,
  },
];

// Keywords to filter education-related content only
const EDUCATION_KEYWORDS = [
  "jamb",
  "utme",
  "waec",
  "neco",
  "admission",
  "university",
  "polytechnic",
  "college",
  "school",
  "student",
  "education",
  "academic",
  "lecture",
  "faculty",
  "department",
  "semester",
  "matriculation",
  "convocation",
  "scholarship",
  "bursary",
  "post-utme",
  "screening",
  "cut-off",
  "aggregate",
  "registration",
  "portal",
  "result",
  "exam",
  "degree",
  "diploma",
  "certificate",
  "nuc",
  "tetfund",
  "asuu",
  "nasu",
  "vice-chancellor",
  "provost",
  "rector",
];

function isEducationRelated(title: string, content: string): boolean {
  const text = (title + " " + content).toLowerCase();
  return EDUCATION_KEYWORDS.some((keyword) => text.includes(keyword));
}

interface NewsItem {
  title: string;
  content: string;
  excerpt: string;
  source: string;
  category: string;
  sourceUrl: string;
  publishedAt: string;
  imageUrl: string | null;
}

// Extract image from RSS content with aggressive pattern matching
function extractImage(content: string): string | null {
  if (!content) return null;

  // Try media:content or media:thumbnail (common in RSS)
  const mediaMatch =
    content.match(/<media:content[^>]*url=["']([^"']+)["']/i) ||
    content.match(/<media:thumbnail[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch && isValidImageUrl(mediaMatch[1])) return mediaMatch[1];

  // Try enclosure with image type
  const enclosureMatch =
    content.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*type=["']image/i) ||
    content.match(/<enclosure[^>]*type=["']image[^>]*url=["']([^"']+)["']/i);
  if (enclosureMatch && isValidImageUrl(enclosureMatch[1])) return enclosureMatch[1];

  // Try enclosure with image extension
  const enclosureExtMatch = content.match(/<enclosure[^>]*url=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
  if (enclosureExtMatch && isValidImageUrl(enclosureExtMatch[1])) return enclosureExtMatch[1];

  // Try all img tags in content and find a good one
  const imgMatches = content.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi);
  for (const match of imgMatches) {
    const url = match[1];
    if (isValidImageUrl(url)) {
      return url;
    }
  }

  // Try image tag (RSS 2.0)
  const imageTagMatch = content.match(/<image>[\s\S]*?<url>([^<]+)<\/url>/i);
  if (imageTagMatch && isValidImageUrl(imageTagMatch[1].trim())) return imageTagMatch[1].trim();

  // Try wp:featuredmedia or featured image patterns
  const featuredMatch = content.match(/featured[_-]?image[^>]*["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
  if (featuredMatch && isValidImageUrl(featuredMatch[1])) return featuredMatch[1];

  // Try data-src (lazy loaded images)
  const dataSrcMatch = content.match(/data-src=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^"']*)["']/i);
  if (dataSrcMatch && isValidImageUrl(dataSrcMatch[1])) return dataSrcMatch[1];

  // Try srcset
  const srcsetMatch = content.match(/srcset=["']([^"']+\.(jpg|jpeg|png|gif|webp)[^\s"']*)[\s"']/i);
  if (srcsetMatch && isValidImageUrl(srcsetMatch[1])) return srcsetMatch[1];

  // Try og:image meta-like patterns
  const ogMatch = content.match(/og:image[^>]*content=["']([^"']+)["']/i);
  if (ogMatch && isValidImageUrl(ogMatch[1])) return ogMatch[1];

  return null;
}

// Validate that the URL is a proper image and not an icon/emoji
function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  // Must start with http
  if (!lowerUrl.startsWith("http")) return false;

  // Exclude common non-content images
  const excludePatterns = [
    "emoji",
    "icon",
    "avatar",
    "logo",
    "favicon",
    "badge",
    "gravatar",
    "placeholder",
    "default",
    "loading",
    "spinner",
    "pixel",
    "tracking",
    "spacer",
    "1x1",
    "blank",
    "wp-includes",
    "plugins",
    "themes/flavor/images", // WordPress system images
  ];

  for (const pattern of excludePatterns) {
    if (lowerUrl.includes(pattern)) return false;
  }

  // Should be an actual image file or image service
  const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|bmp)/i.test(url);
  const isImageService = /unsplash|cloudinary|imgix|wp-content\/uploads/i.test(url);

  return hasImageExtension || isImageService;
}

// Parse RSS XML to extract news items
function parseRSSFeed(xml: string, source: (typeof NEWS_SOURCES)[0]): NewsItem[] {
  const items: NewsItem[] = [];

  // Simple regex-based XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    const title = extractTag(itemContent, "title");
    // Prefer content:encoded for full content, fallback to description
    const fullContent = extractTag(itemContent, "content:encoded");
    const description = extractTag(itemContent, "description");
    const link = extractTag(itemContent, "link");
    const pubDate = extractTag(itemContent, "pubDate");

    // Use the longer content
    const rawContent = fullContent || description;

    if (title && rawContent) {
      // Keep HTML structure but clean dangerous elements
      const cleanedContent = cleanContentHTML(rawContent);
      const plainText = cleanHTML(rawContent);
      const excerpt = plainText.substring(0, 300) + (plainText.length > 300 ? "..." : "");
      const cleanTitle = cleanHTML(title);

      // Extract image from item, content - NO FALLBACK to generic images
      const extractedImage =
        extractImage(itemContent) || extractImage(fullContent || "") || extractImage(description || "");

      // Only include if content is substantial AND education-related
      // Also check content length more strictly to ensure full articles
      if (plainText.length > 300 && isEducationRelated(cleanTitle, plainText)) {
        items.push({
          title: cleanTitle,
          content: cleanedContent,
          excerpt,
          source: source.name,
          category: source.category,
          sourceUrl: link || source.url,
          publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          imageUrl: extractedImage, // Only use actual extracted image, null if none found
        });
      }
    }
  }

  return items.slice(0, 8);
}

function extractTag(content: string, tagName: string): string | null {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, "i");
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();

  // Handle regular tags
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8230;/g, "...")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

// Clean HTML but preserve structure for blog display
function cleanContentHTML(html: string): string {
  return (
    html
      // Remove script/style tags completely
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      // Remove dangerous attributes
      .replace(/\s(onclick|onerror|onload|onmouseover)=["'][^"']*["']/gi, "")
      // Decode HTML entities
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#8230;/g, "...")
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .trim()
  );
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 80)
    .replace(/-+$/, "");
}

async function fetchRSSNews(source: (typeof NEWS_SOURCES)[0]): Promise<NewsItem[]> {
  try {
    console.log(`Fetching from ${source.name}: ${source.url}`);

    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AkboyNewsBot/1.0)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSSFeed(xml, source);
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting education news fetch...");

    // Fetch from all RSS sources
    const allNews: NewsItem[] = [];

    for (const source of NEWS_SOURCES) {
      if (source.isRSS) {
        const items = await fetchRSSNews(source);
        allNews.push(...items);
        console.log(`Fetched ${items.length} items from ${source.name}`);
      }
    }

    console.log(`Total news items fetched: ${allNews.length}`);

    if (allNews.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No new articles found", created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check existing posts to avoid duplicates
    const { data: existingPosts } = await supabase
      .from("blog_posts")
      .select("title")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

    const existingTitles = new Set((existingPosts || []).map((p) => p.title.toLowerCase()));

    // Filter out duplicates
    const newArticles = allNews.filter((item) => !existingTitles.has(item.title.toLowerCase()));

    console.log(`New unique articles: ${newArticles.length}`);

    // Create blog posts
    let createdCount = 0;
    const errors: string[] = [];

    for (const article of newArticles.slice(0, 15)) {
      const slug = generateSlug(article.title) + "-" + Date.now().toString(36);

      // Format content with proper HTML structure and source attribution
      const formattedContent = `
<article>
${article.content}

<hr/>

<p><em>Source: <a href="${article.sourceUrl}" target="_blank" rel="noopener noreferrer">${article.source}</a></em></p>
<p><em>Originally Published: ${new Date(article.publishedAt).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}</em></p>
</article>`;

      // Create tags as a proper array
      const tagsArray = [article.category, "Nigeria", "Education", article.source];

      const { error } = await supabase.from("blog_posts").insert({
        title: article.title,
        slug,
        content: formattedContent,
        excerpt: article.excerpt,
        category: article.category,
        tags: tagsArray,
        featured_image_url: article.imageUrl, // Only actual images, null if none
        is_published: true,
        is_featured: false,
        published_at: article.publishedAt,
        view_count: 0,
      });

      if (error) {
        console.error(`Failed to create post: ${article.title}`, error);
        errors.push(article.title);
      } else {
        createdCount++;
        console.log(`Created post: ${article.title} | Image: ${article.imageUrl ? "Yes" : "No"}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${createdCount} new blog posts`,
        created: createdCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error in fetch-education-news:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
