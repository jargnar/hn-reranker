import { NextResponse } from 'next/server';
import axios from 'axios';
import { Story, RankedStoriesResponse, RankStoriesRequest } from '../../types';
import { preprocessText } from '../../utils/textProcessing';

// Cache for storing fetched stories
interface StoriesCache {
  timestamp: number;
  stories: Story[];
}

let storiesCache: StoriesCache | null = null;
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_STORIES = 100; // Limit to 100 stories for faster processing

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const tokens = preprocessText(text);
  
  // Count token frequency
  const tokenCounts = new Map<string, number>();
  tokens.forEach(token => {
    if (token.length < 3) return; // Skip very short tokens
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });
  
  // Convert to array and sort by frequency
  return Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20) // Limit to top 20 keywords
    .map(([token]) => token);
}

/**
 * Fetch top stories from Hacker News API with caching
 */
async function fetchTopStories(): Promise<Story[]> {
  // Check if we have a valid cache
  if (storiesCache && (Date.now() - storiesCache.timestamp) < CACHE_EXPIRY_MS) {
    console.log('Using cached stories');
    return storiesCache.stories;
  }
  
  try {
    // Fetch top story IDs
    const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const storyIds = response.data.slice(0, MAX_STORIES);
    
    // Fetch stories in parallel batches of 20 for better performance
    const stories: Story[] = [];
    const batchSize = 20;
    
    for (let i = 0; i < storyIds.length; i += batchSize) {
      const batch = storyIds.slice(i, i + batchSize);
      const batchPromises = batch.map((id: number) => 
        axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(res => res.data)
          .catch(err => {
            console.error(`Error fetching story ${id}:`, err);
            return null;
          })
      );
      
      const batchResults = await Promise.all(batchPromises);
      stories.push(...batchResults.filter(Boolean));
    }
    
    // Update cache
    storiesCache = {
      stories,
      timestamp: Date.now()
    };
    
    return stories;
  } catch (error) {
    console.error('Error fetching top stories:', error);
    // If cache exists but is expired, use it as fallback
    if (storiesCache) {
      console.log('Using expired cache as fallback');
      return storiesCache.stories;
    }
    throw error;
  }
}

/**
 * Rank stories based on user bio using optimized algorithm
 */
function rankStoriesByRelevance(stories: Story[], userBio: string): { rankedStories: Story[], userKeywords: string[] } {
  // Extract keywords from user bio
  const userKeywords = extractKeywords(userBio);
  
  // Pre-process user bio once for efficiency
  const userTokens = new Set(preprocessText(userBio));
  
  // Calculate relevance score for each story
  const scoredStories = stories.map(story => {
    // Combine title and text for content analysis
    const storyContent = `${story.title} ${story.text || ''}`;
    const storyTokens = preprocessText(storyContent);
    
    // Calculate relevance score based on keyword matches
    let matchCount = 0;
    for (const token of storyTokens) {
      if (userTokens.has(token)) {
        matchCount++;
      }
    }
    
    // Normalize score based on content length
    const relevanceScore = storyTokens.length > 0 
      ? matchCount / Math.sqrt(storyTokens.length) 
      : 0;
    
    // Return story with relevance score
    return {
      ...story,
      relevanceScore
    };
  });
  
  // Sort stories by relevance score (highest first)
  const rankedStories = scoredStories.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  
  return {
    rankedStories,
    userKeywords
  };
}

export async function POST(request: Request) {
  try {
    const startTime = performance.now();
    const { bio } = await request.json() as RankStoriesRequest;
    
    if (!bio) {
      return NextResponse.json({ error: 'Bio is required' }, { status: 400 });
    }
    
    // Fetch top stories from Hacker News API
    let cacheHit = false;
    const stories = await fetchTopStories();
    
    if (storiesCache && (Date.now() - storiesCache.timestamp) < CACHE_EXPIRY_MS) {
      cacheHit = true;
    }
    
    // Rank stories by relevance to the user's bio
    const { rankedStories, userKeywords } = rankStoriesByRelevance(stories, bio);
    
    const processingTime = Math.round(performance.now() - startTime);
    
    // Return ranked stories
    return NextResponse.json({
      stories: rankedStories,
      userKeywords,
      processingTime,
      cacheHit
    } as RankedStoriesResponse);
  } catch (error) {
    console.error('Error ranking stories:', error);
    return NextResponse.json({ error: 'Failed to rank stories' }, { status: 500 });
  }
} 