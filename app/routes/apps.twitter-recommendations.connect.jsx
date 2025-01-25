import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { ApifyClient } from 'apify-client';
import { prisma } from "../db.server";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const twitterUrl = formData.get("twitterUrl");
  
  if (!twitterUrl) {
    return json({ success: false, error: "No Twitter URL provided" });
  }

  try {
    // Initialize Apify client
    const client = new ApifyClient({
      token: process.env.APIFY_TOKEN,
    });

    // Extract handle from Twitter URL
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

    // Run Apify actor and get tweets
    const run = await client.actor("apidojo~tweet-scraper").call(input);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    // Filter to get only original tweets (not retweets)
    const originalTweets = items
      .filter(tweet => !tweet.isRetweet && !tweet.isQuote)
      .map(tweet => tweet.text)
      .slice(0, 20);

    // Get store products using Shopify Admin API
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
    
    const products = await productsResponse.json();

    // Prepare context for OpenAI
    const prompt = {
      role: "system",
      content: `You are a personalized shopping assistant. Analyze these tweets and product catalog to recommend 3 items that would appeal to this person's personality and style. Explain why each item fits them.

Tweets:
${originalTweets.join('\n')}

Available Products:
${JSON.stringify(products.data.products.edges.map(e => ({
  title: e.node.title,
  description: e.node.description,
  price: e.node.priceRange.minVariantPrice.amount
})), null, 2)}

Recommend 3 products and explain why they match the user's personality based on their tweets.`
    };

    // Get OpenAI recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [prompt],
      temperature: 0.7,
    });

    const recommendations = completion.choices[0].message.content;

    // Store in database
    await prisma.storeRecommendation.create({
      data: {
        shopId: admin.shop,
        twitterHandle: handle,
        tweets: originalTweets,
        recommendations: recommendations
      }
    });

    return json({
      success: true,
      recommendations,
      tweets: originalTweets
    });

  } catch (error) {
    console.error('Error:', error);
    return json({ 
      success: false, 
      error: error.message 
    });
  }
}