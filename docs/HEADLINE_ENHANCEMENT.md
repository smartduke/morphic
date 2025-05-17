# AI Headline Enhancement Feature

This document explains how to use and configure the AI-powered headline enhancement feature in the news component.

## Overview

The headline enhancement feature uses OpenAI's GPT models to rewrite news headlines to be more engaging and interesting while preserving their original meaning. This can make the news tab more compelling for users without changing the factual content.

## Configuration

### Basic Configuration

To enable the headline enhancement feature:

1. Set the `ENHANCE_HEADLINES` environment variable to `true` in your `.env.local` file:

   ```bash
   # Enable AI headline enhancement
   ENHANCE_HEADLINES=true
   ```

2. Ensure you have a valid `OPENAI_API_KEY` set in your environment variables:

   ```bash
   # OpenAI API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Disabling the Feature

To disable headline enhancement:

1. Set `ENHANCE_HEADLINES` to `false` or remove it from your `.env.local` file:

   ```bash
   # Disable AI headline enhancement
   ENHANCE_HEADLINES=false
   ```

## How It Works

1. When enabled, the system fetches news headlines from the configured RSS feeds
2. Before displaying them to the user, it sends the headlines to OpenAI's API
3. The AI model rewrites each headline to be more engaging while preserving its meaning
4. The enhanced headlines are displayed in the news tabs component

## API Usage Considerations

- Headlines are cached for 1 hour to reduce API calls
- Only new or expired headlines will trigger API calls to OpenAI
- Headlines are processed in batches to reduce the number of API calls
- The feature uses GPT-4o-mini which offers improved quality while maintaining reasonable cost
- With default settings, the system will fetch news approximately every 30 minutes

### Monitoring API Usage

To monitor API usage for headline enhancement:

1. Check server logs to see log entries with "Enhanced headlines for category" which indicate when enhancement is being performed
2. OpenAI usage can be monitored in the [OpenAI Dashboard](https://platform.openai.com/usage)
3. Each batch of 5 headlines uses approximately one API request
4. With 8 categories and default 30-minute refresh rate, expect approximately 16 API calls per hour if all categories are viewed

## Technical Details

The headline enhancement is implemented in:

- `/lib/utils/headline-enhancer.ts` - Main enhancement logic
- `/app/api/news-headlines/route.ts` - API integration
- `.env.local` - Configuration settings

### Testing the Enhancement

#### Web API Test

You can test the headline enhancement feature by visiting:

```
/api/test/headlines
```

This endpoint will test the enhancement with sample headlines and return both the original and enhanced versions for comparison.

Example response:
```json
{
  "results": [
    {
      "original": "Study finds correlation between exercise and cognitive function",
      "enhanced": "New Research Reveals Exercise Directly Impacts Brain Performance"
    },
    ...
  ],
  "enabled": true,
  "apiKeySet": true
}
```

#### Command Line Test

You can also test the headline enhancement using the included test script:

```bash
# Using Node.js
node scripts/test-headline-enhancer.js

# Or using Bun
bun scripts/test-headline-enhancer.js
```

This script will output a comparison of original and enhanced headlines to help you verify that the enhancement is working correctly.

## Examples

Original headline:
```
Study finds correlation between exercise and cognitive function
```

Enhanced headline:
```
New Research Reveals Exercise Directly Impacts Brain Performance
```

## Error Handling

If headline enhancement fails for any reason (API errors, rate limits, etc.), the system will automatically fall back to using the original headlines without enhancement.

## Customization

You can adjust the behavior of headline enhancement by modifying:

- The OpenAI model used in `headline-enhancer.ts` (currently set to `gpt-4o-mini`)
- The batch size for processing (default: 5 headlines per batch)
- The temperature setting for creativity level (default: 0.7)
- The system prompt to guide headline style
