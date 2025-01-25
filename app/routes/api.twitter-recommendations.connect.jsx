import { json } from "@remix-run/node";
import { ApifyClient } from 'apify-client';
import { prisma } from "~/db.server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }) {
  console.log('API Route: Received request');
  
  if (request.method !== 'POST') {
    return json({ success: false, error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const { twitterUrl } = body;
    
    console.log('Processing URL:', twitterUrl);

    if (!twitterUrl) {
      return json({ success: false, error: 'No Twitter URL provided' });
    }

    // Initialize Apify client
    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    // Extract handle
    const handle = twitterUrl.split('/').pop().replace('@', '');
    
    // Configure Apify actor input
    const input = {
      "twitterHandles": [handle],
      "maxItems": 20,
      "onlyQuote": false,
      "onlyVideo": false,
      "onlyImage": false,
      "sort": "Latest"
    };

    console.log('Starting Apify scrape for handle:', handle);

    // Run Apify actor
    const run = await client.actor("apidojo~tweet-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    const originalTweets = items
      .filter(tweet => !tweet.isRetweet && !tweet.isQuote)
      .map(tweet => tweet.text)
      .slice(0, 20);

    console.log('Fetched tweets:', originalTweets.length);

    // For now, return a simple success response
    // We'll add OpenAI processing later
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