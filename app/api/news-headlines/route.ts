import { enhanceHeadlines } from '@/lib/utils/headline-enhancer';
import { XMLParser } from 'fast-xml-parser';
import { NextResponse } from 'next/server';

// Available news categories - keep this in sync with the NewsCategoryTabs component
const NEWS_CATEGORIES = ['LOCAL', 'WORLD', 'BUSINESS', 'TECHNOLOGY', 'ENTERTAINMENT', 'SCIENCE', 'SPORTS', 'HEALTH'];

// Default Google News RSS feed URLs if not set in environment variables
const DEFAULT_RSS_URLS: Record<string, string> = {
  'LOCAL': 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
  'WORLD': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'BUSINESS': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'TECHNOLOGY': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'ENTERTAINMENT': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNREpxYW5RU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'SCIENCE': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp0Y1RjU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'SPORTS': 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRFp1ZEdvU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en',
  'HEALTH': 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNR3QwTlRFU0FtVnVLQUFQAQ?hl=en-US&gl=US&ceid=US:en'
};

export async function GET(request: Request) {
  // Get the category from the query string
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'LOCAL';
  
  // Get the RSS URL from environment variable or use default
  // Format: RSS_URL_CATEGORY (e.g., RSS_URL_LOCAL, RSS_URL_WORLD, etc.)
  const envVarName = `RSS_URL_${category}`;
  const rssUrl = process.env[envVarName] || DEFAULT_RSS_URLS[category] || DEFAULT_RSS_URLS['LOCAL'];
  
  try {
    // Fetch the RSS feed
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsHeadlinesBot/1.0)'
      },
      next: { revalidate: 1800 } // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status} ${response.statusText}`);
    }

    const xmlData = await response.text();
    
    // Parse XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    
    const result = parser.parse(xmlData);
    
    // Extract headlines from the parsed data
    const items = result.rss?.channel?.item || [];
    
    // Format the headlines
    let headlines = items.slice(0, 10).map((item: any) => {
      // Clean title by removing source attribution if present
      const title = item.title || '';
      const cleanTitle = title
        .replace(/^Video:\s*/i, '')     // Remove "Video:" prefix (case insensitive)
        .replace(/^Watch:\s*/i, '')     // Remove "Watch:" prefix
        .replace(/^Audio:\s*/i, '')     // Remove "Audio:" prefix
        .replace(/^Podcast:\s*/i, '')   // Remove "Podcast:" prefix
        .replace(/^Live:\s*/i, '')      // Remove "Live:" prefix
        .replace(/\s+-\s+.*$/, '')      // Remove "- Source" format
        .replace(/\s+\|.*$/, '')        // Remove "| Source" format
        .trim();
        
      return {
        heading: cleanTitle,
        message: cleanTitle,  // Keep original message for search
        pubDate: item.pubDate || '',
        link: item.link || ''
      };
    });
    
    console.log(`Fetched ${headlines.length} headlines from Google News RSS for category ${category}`);

    // Enhance headlines with AI if enabled
    if (process.env.ENHANCE_HEADLINES === 'true') {
      try {
        console.log(`Enhancing headlines for category ${category} using GPT-4.1-Nano...`);
        const startTime = Date.now();
        headlines = await enhanceHeadlines(headlines);
        const duration = Date.now() - startTime;
        console.log(`Enhanced ${headlines.length} headlines for category ${category} in ${duration}ms`);
      } catch (error) {
        console.error('Failed to enhance headlines:', error);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
        // Continue with original headlines if enhancement fails
      }
    }

    return NextResponse.json({ 
      headlines,
      category
    });
  } catch (error) {
    console.error('Error fetching news headlines:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch news headlines',
      headlines: [] 
    }, { status: 500 });
  }
}
