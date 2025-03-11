// Story interface representing a Hacker News story
export interface Story {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  kids?: number[];
  descendants?: number;
  type: string;
  relevanceScore?: number;
}

// API response interface
export interface RankedStoriesResponse {
  stories: Story[];
  userKeywords: string[];
  processingTime: number;
  cacheHit: boolean;
}

// API request interface
export interface RankStoriesRequest {
  bio: string;
} 