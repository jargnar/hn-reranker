'use client';

import { useState, useEffect } from 'react';

interface StoryFiltersProps {
  onFilterChange: (value: number) => void;
  onSortChange: (value: 'relevance' | 'score' | 'date') => void;
}

export default function StoryFilters({ onFilterChange, onSortChange }: StoryFiltersProps) {
  const [relevanceFilter, setRelevanceFilter] = useState(0);
  const [sortOption, setSortOption] = useState<'relevance' | 'score' | 'date'>('relevance');
  
  // Debounce the filter change to avoid excessive re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(relevanceFilter);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [relevanceFilter, onFilterChange]);
  
  const handleSortChange = (value: 'relevance' | 'score' | 'date') => {
    setSortOption(value);
    onSortChange(value);
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
      <div className="flex-1">
        <label htmlFor="relevance-filter" className="block mb-2 text-sm font-medium">
          Minimum Relevance Score: {relevanceFilter}%
        </label>
        <input
          id="relevance-filter"
          type="range"
          min="0"
          max="100"
          value={relevanceFilter}
          onChange={(e) => setRelevanceFilter(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>
      
      <div className="flex-1">
        <label className="block mb-2 text-sm font-medium">
          Sort By
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('relevance')}
            className={`px-3 py-1 text-sm rounded-md ${
              sortOption === 'relevance' 
                ? 'bg-foreground text-background' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Relevance
          </button>
          <button
            onClick={() => handleSortChange('score')}
            className={`px-3 py-1 text-sm rounded-md ${
              sortOption === 'score' 
                ? 'bg-foreground text-background' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            HN Score
          </button>
          <button
            onClick={() => handleSortChange('date')}
            className={`px-3 py-1 text-sm rounded-md ${
              sortOption === 'date' 
                ? 'bg-foreground text-background' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Newest
          </button>
        </div>
      </div>
    </div>
  );
} 