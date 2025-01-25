import { json } from "@remix-run/node";
import { ApifyClient } from 'apify-client';
import OpenAI from 'openai';

export const loader = ({ request }) => {
  // Handle GET requests if needed
  return json({ message: 'Twitter recommendations proxy endpoint' });
};

export async function action({ request }) {
  console.log('Proxy Route: Received request');

  try {
    const body = await request.json();
    const { twitterUrl } = body;
    
    console.log('Processing URL:', twitterUrl);

    if (!twitterUrl) {
      return json({ success: false, error: 'No Twitter URL provided' });
    }

    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    const handle = twitterUrl.split('/').pop().replace('@', '');
    console.log('Processing handle:', handle);

    const input = {
      "twitterHandles": [handle],
      "maxItems": 20,
      "onlyQuote": false,
      "onlyVideo": false,
      "onlyImage": false,
      "sort": "Latest"
    };

    console.log('Starting Apify scrape');
    const run = await client.actor("apidojo~tweet-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    const originalTweets = items
      .filter(tweet => !tweet.isRetweet && !tweet.isQuote)
      .map(tweet => tweet.text)
      .slice(0, 20);

    console.log('Fetched tweets:', originalTweets.length);

    return json({
      success: true,
      handle,
      tweetCount: originalTweets.length,
      tweets: originalTweets
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return json({ 
      success: false, 
      error: error.message || 'An error occurred'
    }, { status: 500 });
  }
}