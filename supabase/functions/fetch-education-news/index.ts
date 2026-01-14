import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Nigerian education news RSS feeds and sources
const NEWS_SOURCES = [
  {
    name: 'JAMB News',
    url: 'https://www.jamb.gov.ng',
    category: 'JAMB/Admissions',
    keywords: ['JAMB', 'UTME', 'admission', 'registration', 'result', 'cut-off']
  },
  {
    name: 'MySchoolGist',
    url: 'https://www.myschool.ng/news/rss',
    category: 'Education News',
    isRSS: true
  },
  {
    name: 'Nigerian Scholars',
    url: 'https://nigerianscholars.com/feed/',
    category: 'Scholarships',
    isRSS: true
  },
  {
    name: 'Education News Nigeria',
    url: 'https://dailypost.ng/category/education/feed/',
    category: 'University News',
    isRSS: true
  }
];

interface NewsItem {
  title: string;
  content: string;
  excerpt: string;
  source: string;
  category: string;
  sourceUrl: string;
  publishedAt: string;
}

// Parse RSS XML to extract news items
function parseRSSFeed(xml: string, source: typeof NEWS_SOURCES[0]): NewsItem[] {
  const items: NewsItem[] = [];
  
  // Simple regex-based XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const title = extractTag(itemContent, 'title');
    const description = extractTag(itemContent, 'description') || extractTag(itemContent, 'content:encoded');
    const link = extractTag(itemContent, 'link');
    const pubDate = extractTag(itemContent, 'pubDate');
    
    if (title && description) {
      // Clean HTML from description
      const cleanContent = cleanHTML(description);
      const excerpt = cleanContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : '');
      
      items.push({
        title: cleanHTML(title),
        content: cleanContent,
        excerpt,
        source: source.name,
        category: source.category,
        sourceUrl: link || source.url,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString()
      });
    }
  }
  
  return items.slice(0, 5); // Limit to 5 items per source
}

function extractTag(content: string, tagName: string): string | null {
  // Handle CDATA sections
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i');
  const cdataMatch = content.match(cdataRegex);
  if (cdataMatch) return cdataMatch[1].trim();
  
  // Handle regular tags
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : null;
}

function cleanHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 80)
    .replace(/-+$/, '');
}

async function fetchRSSNews(source: typeof NEWS_SOURCES[0]): Promise<NewsItem[]> {
  try {
    console.log(`Fetching from ${source.name}: ${source.url}`);
    
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AkboyNewsBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting education news fetch...');
    
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
      return new Response(
        JSON.stringify({ success: true, message: 'No new articles found', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check existing posts to avoid duplicates
    const { data: existingPosts } = await supabase
      .from('blog_posts')
      .select('title')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days
    
    const existingTitles = new Set((existingPosts || []).map(p => p.title.toLowerCase()));
    
    // Filter out duplicates
    const newArticles = allNews.filter(item => 
      !existingTitles.has(item.title.toLowerCase())
    );
    
    console.log(`New unique articles: ${newArticles.length}`);
    
    // Create blog posts
    let createdCount = 0;
    const errors: string[] = [];
    
    for (const article of newArticles.slice(0, 10)) { // Limit to 10 per run
      const slug = generateSlug(article.title) + '-' + Date.now().toString(36);
      
      // Format content with source attribution
      const formattedContent = `${article.content}\n\n---\n\n*Source: [${article.source}](${article.sourceUrl})*\n\n*Published: ${new Date(article.publishedAt).toLocaleDateString('en-NG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}*`;
      
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: article.title,
          slug,
          content: formattedContent,
          excerpt: article.excerpt,
          category: article.category,
          tags: JSON.stringify([article.category, 'Nigeria', 'Education', article.source]),
          is_published: true, // Auto-publish
          is_featured: false,
          published_at: article.publishedAt,
          view_count: 0
        });
      
      if (error) {
        console.error(`Failed to create post: ${article.title}`, error);
        errors.push(article.title);
      } else {
        createdCount++;
        console.log(`Created post: ${article.title}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${createdCount} new blog posts`,
        created: createdCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error in fetch-education-news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
