'use client';

import { useState, useMemo } from 'react';
import axios from 'axios';
import { Story, RankedStoriesResponse } from './types';
import KeywordDisplay from './components/KeywordDisplay';
import RelevanceScore from './components/RelevanceScore';
import MatchingKeywords from './components/MatchingKeywords';
import LoadingSpinner from './components/LoadingSpinner';
import StoryFilters from './components/StoryFilters';
import PerformanceMetrics from './components/PerformanceMetrics';

export default function Home() {
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [userKeywords, setUserKeywords] = useState<string[]>([]);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  const [error, setError] = useState('');
  const [minRelevanceScore, setMinRelevanceScore] = useState(0);
  const [sortBy, setSortBy] = useState<'relevance' | 'score' | 'date'>('relevance');

  const sampleBio = "I am a theoretical biologist, interested in disease ecology. My tools are R, clojure, compartmentalism disease modeling, and statistical GAM models, using a variety of data layers (geophysical, reconstructions, climate, biodiversity, land use). Besides that I am interested in tech applied to the a subset of the current problems of the world (agriculture / biodiversity / conservation / forecasting), development of third world countries and AI, large language models.";

  const useSampleBio = () => {
    setBio(sampleBio);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bio.trim()) {
      setError('Please enter your bio to rank stories');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setProcessingTime(null);
    
    try {
      const startTime = performance.now();
      const response = await axios.post<RankedStoriesResponse>('/api/rank-stories', { bio });
      const clientTime = performance.now() - startTime;
      
      setStories(response.data.stories);
      setUserKeywords(response.data.userKeywords || []);
      setProcessingTime(response.data.processingTime || Math.round(clientTime));
      setCacheHit(response.data.cacheHit || false);
    } catch (err) {
      console.error('Error fetching ranked stories:', err);
      setError('Failed to fetch and rank stories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort stories based on user preferences
  const filteredAndSortedStories = useMemo(() => {
    // First, filter by minimum relevance score
    const filtered = stories.filter(story => {
      const scorePercentage = Math.round((story.relevanceScore || 0) * 100);
      return scorePercentage >= minRelevanceScore;
    });
    
    // Then, sort based on the selected sort method
    return [...filtered].sort((a, b) => {
      if (sortBy === 'relevance') {
        return (b.relevanceScore || 0) - (a.relevanceScore || 0);
      } else if (sortBy === 'score') {
        return b.score - a.score;
      } else { // date
        return b.time - a.time;
      }
    });
  }, [stories, minRelevanceScore, sortBy]);

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">🏆 Suhas' Hacker News Reranker App</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your bio to get Hacker News stories ranked by relevance to your interests
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="bio" className="block mb-2 font-medium">
            Your Bio / Interests
          </label>
          <textarea
            id="bio"
            rows={5}
            className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            placeholder="Describe your interests, skills, and background..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button
            type="button"
            onClick={useSampleBio}
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Use sample bio
          </button>
        </div>
        
        <KeywordDisplay bio={bio} />
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Ranking Stories...' : 'Rank Stories'}
        </button>
        
        {error && (
          <p className="mt-2 text-red-500">{error}</p>
        )}
      </form>

      {isLoading && (
        <LoadingSpinner message="Fetching and ranking stories based on your interests..." />
      )}

      {!isLoading && stories.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Top Stories Ranked For You</h2>
          
          {processingTime && (
            <PerformanceMetrics 
              processingTime={processingTime}
              storiesCount={stories.length}
              cacheHit={cacheHit}
            />
          )}
          
          <StoryFilters 
            onFilterChange={setMinRelevanceScore}
            onSortChange={setSortBy}
          />
          
          <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedStories.length} stories with relevance score ≥ {minRelevanceScore}%
          </p>
          
          {filteredAndSortedStories.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedStories.map((story) => (
                <div key={story.id} className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <h3 className="font-medium">
                    {story.url ? (
                      <a 
                        href={story.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {story.title}
                      </a>
                    ) : (
                      story.title
                    )}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>By {story.by} • </span>
                    <span>{new Date(story.time * 1000).toLocaleString()} • </span>
                    <span>{story.score} points</span>
                  </div>
                  {story.text && (
                    <div 
                      className="mt-2 text-sm"
                      dangerouslySetInnerHTML={{ __html: story.text }}
                    />
                  )}
                  <div className="mt-2">
                    <RelevanceScore 
                      score={story.relevanceScore || 0} 
                      title={story.title}
                      userBio={bio}
                    />
                  </div>
                  <MatchingKeywords 
                    storyContent={`${story.title} ${story.text || ''}`}
                    userKeywords={userKeywords}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-center">
              <p>No stories match the current relevance threshold. Try lowering the minimum relevance score.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
