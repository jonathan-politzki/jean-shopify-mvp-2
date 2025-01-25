import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ApifyClient } from 'apify-client';
import { prisma } from "../db.server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }) {
  // Log request details for debugging
  console.log('Received request to /apps/twitter-recommendations/connect');
  
  try {
    // Handle both admin and theme contexts
    let admin;
    try {
      const auth = await authenticate.admin(request);
      admin = auth.admin;
    } catch (error) {
      console.log('Not an admin request, attempting theme authentication');
      // Handle theme request authentication here if needed
    }

    const body = await request.json();
    const { twitterUrl, context } = body;
    
    if (!twitterUrl) {
      console.log('No Twitter URL provided');
      return json({ success: false, error: "No Twitter URL provided" });
    }

    console.log('Processing Twitter URL:', twitterUrl);

    // Initialize Apify client
    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    // Extract handle from Twitter URL
    const handle = twitterUrl.split('/').pop().replace('@', '');
    
    console.log('Extracted handle:', handle);

    // Configure Apify actor input
    const input = {
      "twitterHandles": [handle],
      "maxItems": 20,
      "onlyQuote": false,
      "onlyVideo": false,
      "onlyImage": false,
      "sort": "Latest"
    };

    console.log('Starting Apify scrape');

    // Run Apify actor and get tweets
    const run = await client.actor("apidojo~tweet-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    // Filter to get only original tweets
    const originalTweets = items
      .filter(tweet => !tweet.isRetweet && !tweet.isQuote)
      .map(tweet => tweet.text)
      .slice(0, 20);

    console.log('Fetched tweets:', originalTweets.length);

    // If we have admin access, get store products
    let products = [];
    if (admin) {
      const productsResponse = await admin.graphql(
        `query {
          products(first: 50) {
            edges {
              node {
                id
                title
                description
                handle
                priceRange {
                  minVariantPrice {
                    amount
                  }
                }
              }
            }
          }
        }`
      );
      
      products = await productsResponse.json();
      console.log('Fetched products:', products.data.products.edges.length);
    }

    // Prepare context for OpenAI
    const prompt = {
      role: "system",
      content: `You are a personalized shopping assistant. Analyze these tweets and product catalog to recommend 3 items that would appeal to this person's personality and style. Explain why each item fits them.

Tweets:
${originalTweets.join('\n')}

Available Products:
${JSON.stringify(products.data?.products.edges.map(e => ({
  title: e.node.title,
  description: e.node.description,
  price: e.node.priceRange.minVariantPrice.amount
})) || [], null, 2)}

Recommend 3 products and explain why they match the user's personality based on their tweets.`
    };

    console.log('Generating recommendations with OpenAI');

    // Get OpenAI recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [prompt],
      temperature: 0.7,
    });

    const recommendations = completion.choices[0].message.content;

    console.log('Generated recommendations');

    // Store in database
    const stored = await prisma.storeRecommendation.create({
      data: {
        shopId: admin?.shop || 'theme_request',
        twitterHandle: handle,
        tweets: originalTweets,
        recommendations: recommendations
      }
    });

    console.log('Stored recommendations in database');

    return json({
      success: true,
      recommendations,
      tweets: originalTweets
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return json({ 
      success: false, 
      error: error.message || 'An error occurred processing your request'
    });
  }
}