import { testHeadlineEnhancement } from '@/lib/utils/headline-enhancer';
import { NextResponse } from 'next/server';

/**
 * Test route to validate the headline enhancement functionality
 * This is useful for checking if the OpenAI integration is working correctly
 * without having to fetch real RSS feeds
 */
export async function GET() {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.ENHANCE_HEADLINES !== 'true') {
      return NextResponse.json({
        error: 'Headline enhancement is disabled or OpenAI API key is not set',
        enabled: process.env.ENHANCE_HEADLINES === 'true',
        apiKeySet: !!process.env.OPENAI_API_KEY
      }, { status: 400 });
    }
    
    const results = await testHeadlineEnhancement();
    
    return NextResponse.json({
      results,
      enabled: process.env.ENHANCE_HEADLINES === 'true',
      apiKeySet: !!process.env.OPENAI_API_KEY
    });
  } catch (error) {
    console.error('Error testing headline enhancement:', error);
    return NextResponse.json({ 
      error: 'Failed to test headline enhancement',
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
