'use client'

/**
 * Fetches current news headlines from Google News RSS feed via our API endpoint
 * 
 * @returns {Promise<Array<{heading: string, message: string}>>} An array of news headline objects
 */
export async function getNewsHeadlines(): Promise<Array<{ heading: string, message: string }>> {
  try {
    // Fetch from our API endpoint that processes the RSS feed
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/news-headlines`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.headlines || data.headlines.length === 0) {
      console.warn('No headlines returned from API');
      return getDefaultHeadlines();
    }
    
    console.log(`Received ${data.headlines.length} headlines from API`);
    
    // Filter out any headlines that are too short or just generic website names
    const filteredHeadlines = data.headlines.filter((item: any) => {
      const heading = item.heading || '';
      return (
        heading.length > 10 && 
        !heading.match(/^(CNN|BBC|News|Google News|Yahoo|Headlines)$/i)
      );
    });
    
    // Take the top 8 headlines (to fit nicely in the UI)
    return filteredHeadlines.slice(0, 8).map((item: any) => ({
      heading: item.heading,
      message: item.heading  // Use the heading as the search query when clicked
    }));
  } catch (error) {
    console.error('Error fetching news headlines:', error)
    return getDefaultHeadlines()
  }
}

/**
 * Returns default headlines in case the API call fails
 */
function getDefaultHeadlines(): Array<{ heading: string, message: string }> {
  return [
    {
      heading: 'Operation Sindoor boosts Indian defense sector and stocks',
      message: 'Operation Sindoor boosts Indian defense sector and stocks'
    },
    {
      heading: 'India to Cut 100% Tariffs on US Goods, Trump Says',
      message: 'India to Cut 100% Tariffs on US Goods, Trump Says'
    },
    {
      heading: 'NJ Transit strike disrupts service affecting 300,000 commuters',
      message: 'NJ Transit strike disrupts service affecting 300,000 commuters'
    },
    {
      heading: 'Trump signs $1 trillion deals with Saudi Arabia and Qatar',
      message: 'Trump signs $1 trillion deals with Saudi Arabia and Qatar'
    },
    {
      heading: 'India\'s Operation Sindoor boosts defense companies\' shares',
      message: 'India\'s Operation Sindoor boosts defense companies\' shares'
    },
    {
      heading: 'Activision ends Call of Duty: Warzone Mobile support',
      message: 'Activision ends Call of Duty: Warzone Mobile support'
    }
  ]
}
