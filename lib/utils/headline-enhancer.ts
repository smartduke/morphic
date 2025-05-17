// filepath: /Users/dinakar/morphic/morphic/lib/utils/headline-enhancer.ts
import { createOpenAI } from '@ai-sdk/openai';

// Simple in-memory cache to store enhanced headlines
// The key is the original headline, and the value is the enhanced headline
const headlineCache: Record<string, { heading: string, timestamp: number }> = {};

// Cache TTL in milliseconds (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Tests headline enhancement with sample headlines
 * This can be used to validate the headline enhancement quality
 * @returns Array of original and enhanced headlines for comparison
 */
export async function testHeadlineEnhancement(): Promise<Array<{original: string; enhanced: string}>> {
  // Sample headlines for testing
  const sampleHeadlines = [
    { heading: "Study finds correlation between exercise and cognitive function", message: "", pubDate: "", link: "" },
    { heading: "Tech company announces new smartphone model", message: "", pubDate: "", link: "" },
    { heading: "Scientists discover new species in Amazon rainforest", message: "", pubDate: "", link: "" },
    { heading: "Global market shows signs of recovery after recession", message: "", pubDate: "", link: "" },
    { heading: "Local authorities implement new traffic regulations", message: "", pubDate: "", link: "" }
  ];
  
  try {
    const enhanced = await enhanceHeadlines(sampleHeadlines);
    // Return comparison of original and enhanced headlines
    return sampleHeadlines.map((original, index) => ({
      original: original.heading,
      enhanced: enhanced[index]?.heading || original.heading
    }));
  } catch (error) {
    console.error("Test headline enhancement failed:", error);
    return sampleHeadlines.map(h => ({ original: h.heading, enhanced: "Enhancement failed" }));
  }
}

/**
 * Enhances news headlines to make them more engaging while preserving their meaning
 * Uses OpenAI's API through direct API calls to rewrite the headlines
 * 
 * This feature can be enabled/disabled with the ENHANCE_HEADLINES environment variable
 * 
 * @param headlines Array of original headlines with their metadata
 * @returns Array of enhanced headlines with the same meaning but more engaging wording
 */
export async function enhanceHeadlines(
  headlines: Array<{ heading: string; message: string; pubDate: string; link: string }>
): Promise<Array<{ heading: string; message: string; pubDate: string; link: string }>> {
  if (!headlines || headlines.length === 0) {
    return [];
  }
  
  if (!process.env.OPENAI_API_KEY || process.env.ENHANCE_HEADLINES !== 'true') {
    // Return original headlines if API key is not present or feature is disabled
    return headlines;
  }
  
  const now = Date.now();
  
  // Check which headlines are already in cache and still valid
  const results = [];
  const headlinesToProcess = [];
  const headlineMap = new Map(); // To track original positions
  
  // First pass: use cache where available
  for (let i = 0; i < headlines.length; i++) {
    const headline = headlines[i];
    const cachedResult = headlineCache[headline.heading];
    
    if (cachedResult && (now - cachedResult.timestamp) < CACHE_TTL) {
      // Use cached result if it's still valid
      results[i] = {
        ...headline,
        heading: cachedResult.heading
      };
      console.log(`Using cached enhanced headline for: "${headline.heading.substring(0, 30)}..."`);
    } else {
      // Need to process this headline
      headlinesToProcess.push(headline);
      headlineMap.set(headline.heading, i);
      results[i] = null; // Placeholder
    }
  }
  
  // If all headlines were in cache, we can return immediately
  if (headlinesToProcess.length === 0) {
    console.log('All headlines found in cache, skipping API call');
    return results.filter(Boolean) as Array<{ heading: string; message: string; pubDate: string; link: string }>;
  }

  try {
    // Process headlines in batches to avoid rate limits and reduce tokens
    const batchSize = 5;

    for (let i = 0; i < headlinesToProcess.length; i += batchSize) {
      const batch = headlinesToProcess.slice(i, i + batchSize);
      const batchHeadings = batch.map(h => h.heading).join('\n');
      
      const content = `
Rewrite the following news headlines to make them more engaging and interesting, 
while preserving their exact meaning. Make them captivating but don't exaggerate or 
add information that's not in the original. Keep them concise, factual and accurate.
Don't use clickbait techniques. Format the output as one headline per line.

Headlines:
${batchHeadings}
`;

      console.log(`Enhancing batch of ${batch.length} headlines with OpenAI`);
      
      const apiKey = process.env.OPENAI_API_KEY;
      const modelName = 'gpt-4o-mini'; // Using GPT-4o-mini for better quality enhancements
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.7,
          messages: [
            {
              role: 'system',
              content: 'You are a skilled news editor who rewrites headlines to be more engaging while preserving their exact meaning.'
            },
            {
              role: 'user',
              content
            }
          ]
        })
      });
      
      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.text();
        console.error(`OpenAI API Error: ${openaiResponse.status}`, errorData);
        
        // Use original headlines for this batch if API call fails
        for (const headline of batch) {
          const index = headlineMap.get(headline.heading);
          if (index !== undefined) {
            results[index] = headline;
          }
        }
        continue;
      }
      
      const jsonResponse = await openaiResponse.json();
      
      // Extract the response text from the OpenAI API response
      let responseText = '';
      
      if (jsonResponse.choices && 
          jsonResponse.choices.length > 0 && 
          jsonResponse.choices[0].message && 
          jsonResponse.choices[0].message.content) {
        responseText = jsonResponse.choices[0].message.content;
      }
      
      if (!responseText) {
        console.warn('No response text extracted from OpenAI response');
        // Use original headlines for this batch if enhancement fails
        for (const headline of batch) {
          const index = headlineMap.get(headline.heading);
          if (index !== undefined) {
            results[index] = headline;
          }
        }
        continue;
      }

      // Split the response into lines and match with original headlines
      const enhancedTitles = responseText.trim().split('\n').filter((line: string) => line.trim() !== '');
      
      // Process each headline in the batch
      for (let j = 0; j < batch.length; j++) {
        const originalHeadline = batch[j];
        const index = headlineMap.get(originalHeadline.heading);
        
        if (index === undefined) continue;
        
        if (j < enhancedTitles.length) {
          const enhancedTitle = enhancedTitles[j].trim();
          
          // Only use enhanced headline if it's not empty
          if (enhancedTitle) {
            results[index] = {
              ...originalHeadline,
              heading: enhancedTitle
            };
            
            // Update cache with timestamp
            headlineCache[originalHeadline.heading] = { 
              heading: enhancedTitle, 
              timestamp: now 
            };
          } else {
            results[index] = originalHeadline;
          }
        } else {
          // If there are fewer enhanced titles than original headlines, use the original
          results[index] = originalHeadline;
        }
      }
    }

    // Calculate enhancement statistics
    const enhancedCount = results.filter((headline, i) => 
      headlines[i] && headline && headline.heading !== headlines[i].heading
    ).length;
    
    console.log(`Successfully enhanced ${enhancedCount}/${headlines.length} headlines with GPT-4o-mini`);
    
    // Replace any remaining nulls with original headlines
    return results.map((result, i) => result || headlines[i]) as Array<{ heading: string; message: string; pubDate: string; link: string }>;
  } catch (error) {
    console.error('Error enhancing headlines:', error);
    // Log detailed error info if available
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
    }
    // Return original headlines if enhancement fails
    return headlines;
  }
}
