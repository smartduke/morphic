# Customizing News Headlines

Morphic allows you to customize the news headlines component in two ways:
1. Change the RSS feed sources for each category
2. Enable AI enhancement for more engaging headlines

This guide explains both configuration options.

## Configuration via Environment Variables

You can customize the RSS feeds for different news categories by setting environment variables in your `.env.local` file.

The format for these variables is: `RSS_URL_CATEGORY` where `CATEGORY` is the name of the news category in uppercase.

For example:
- `RSS_URL_LOCAL` - For local news
- `RSS_URL_WORLD` - For world news
- `RSS_URL_TECHNOLOGY` - For technology news

## Available Categories

The following categories are available in the News Headlines component:

- `LOCAL`
- `WORLD`
- `BUSINESS`
- `TECHNOLOGY`
- `ENTERTAINMENT`
- `SCIENCE`
- `SPORTS`
- `HEALTH`

## Example Configuration

Here's an example `.env.local` configuration for the RSS feeds:

```
# Local news RSS feed
RSS_URL_LOCAL=https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en

# World news RSS feed
RSS_URL_WORLD=https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGx6TVdZU0JXVnVMVWRDR2dKSlRpZ0FQAQ?hl=en-US&gl=US&ceid=US:en

# Technology news RSS feed - using a custom feed from Ars Technica
RSS_URL_TECHNOLOGY=https://feeds.arstechnica.com/arstechnica/index
```

## Using Custom RSS Sources

You can use any valid RSS feed URL in your configuration. Some popular RSS feed sources include:

- **New York Times**: `https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml`
- **BBC News**: `http://feeds.bbci.co.uk/news/rss.xml`
- **CNN**: `http://rss.cnn.com/rss/edition.rss`
- **Ars Technica**: `https://feeds.arstechnica.com/arstechnica/index`
- **Hacker News**: `https://feeds.feedburner.com/TheHackersNews`
- **ESPN Sports**: `https://www.espn.com/espn/rss/news`

## Default Configuration

If you don't specify an RSS feed URL for a category, Morphic will use the default Google News RSS feeds for that category.

## Headline Enhancement with AI

Morphic can use AI to automatically enhance your news headlines, making them more interesting and engaging while preserving their original meaning. This feature is optional and can be enabled in your `.env.local` file.

### Enabling Headline Enhancement

To enable AI-powered headline enhancement, add the following to your `.env.local` file:

```
ENHANCE_HEADLINES=true
```

When enabled, the system will use OpenAI's API to rewrite the headlines from your RSS feeds to make them more engaging while keeping the same meaning.

### How It Works

1. The original headlines are fetched from the RSS feeds
2. The headlines are sent to OpenAI's API in small batches
3. The AI rewrites each headline to be more engaging
4. The enhanced headlines are displayed in the News Headlines component
5. The original headline text is still used for search functionality

### API Usage and Costs

This feature uses your OpenAI API key and will consume API credits when enabled. The system uses `gpt-3.5-turbo` which has a low cost per token, but please be aware that:

- Each refresh of the news categories will generate API calls
- Headlines are processed in batches to minimize API usage
- The original headlines are used if the API call fails or times out

To disable this feature and save on API costs, set:

```
ENHANCE_HEADLINES=false
```

## Troubleshooting

If you're experiencing issues with your custom RSS feeds:

1. Make sure the URL is a valid RSS feed URL
2. Check that the RSS feed is publicly accessible without authentication
3. Verify the XML format by opening the URL in a browser
4. Some RSS feeds may have rate limiting, so be careful with high-volume applications

For headline enhancement issues:

1. Check that your OpenAI API key is valid and has available credits
2. Look for errors in the console logs
3. If headlines aren't being enhanced, try setting a higher timeout or reducing the batch size in the code
