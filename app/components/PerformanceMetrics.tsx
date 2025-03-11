'use client';

import { useState } from 'react';

interface PerformanceMetricsProps {
  processingTime: number;
  storiesCount: number;
  cacheHit?: boolean;
}

export default function PerformanceMetrics({ 
  processingTime, 
  storiesCount,
  cacheHit = false
}: PerformanceMetricsProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Calculate metrics
  const timePerStory = storiesCount > 0 ? (processingTime / storiesCount).toFixed(2) : 0;
  
  // Determine performance rating
  let performanceRating = 'Excellent';
  let ratingColor = 'text-green-600 dark:text-green-400';
  
  if (processingTime > 2000) {
    performanceRating = 'Good';
    ratingColor = 'text-blue-600 dark:text-blue-400';
  }
  
  if (processingTime > 5000) {
    performanceRating = 'Average';
    ratingColor = 'text-yellow-600 dark:text-yellow-400';
  }
  
  if (processingTime > 10000) {
    performanceRating = 'Slow';
    ratingColor = 'text-red-600 dark:text-red-400';
  }

  return (
    <div className="mb-4 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`text-sm font-medium ${ratingColor}`}>
            {performanceRating}
          </div>
          <span className="mx-2 text-gray-400">•</span>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Processed in {(processingTime / 1000).toFixed(2)}s
          </div>
          {cacheHit && (
            <>
              <span className="mx-2 text-gray-400">•</span>
              <div className="text-sm text-green-600 dark:text-green-400">
                Cache hit
              </div>
            </>
          )}
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">Processing time:</div>
            <div>{processingTime}ms</div>
            
            <div className="text-gray-600 dark:text-gray-400">Stories processed:</div>
            <div>{storiesCount}</div>
            
            <div className="text-gray-600 dark:text-gray-400">Time per story:</div>
            <div>{timePerStory}ms</div>
            
            <div className="text-gray-600 dark:text-gray-400">Cache status:</div>
            <div>{cacheHit ? 'Hit (faster)' : 'Miss (slower)'}</div>
          </div>
        </div>
      )}
    </div>
  );
} 