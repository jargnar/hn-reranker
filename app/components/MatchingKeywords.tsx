'use client';

import { useMemo } from 'react';
import { preprocessText } from '../utils/clientTextProcessing';

interface MatchingKeywordsProps {
  storyContent: string;
  userKeywords: string[];
}

export default function MatchingKeywords({ storyContent, userKeywords }: MatchingKeywordsProps) {
  // Calculate matching keywords on the client side for better performance
  const matchingKeywords = useMemo(() => {
    if (!storyContent || !userKeywords.length) return [];
    
    // Process story content
    const storyTokens = new Set(preprocessText(storyContent));
    
    // Find matching keywords
    return userKeywords.filter(keyword => storyTokens.has(keyword));
  }, [storyContent, userKeywords]);
  
  if (!matchingKeywords.length) return null;
  
  return (
    <div className="mt-2">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
        Matching keywords:
      </p>
      <div className="flex flex-wrap gap-1">
        {matchingKeywords.slice(0, 10).map((keyword, index) => (
          <span 
            key={index}
            className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
          >
            {keyword}
          </span>
        ))}
        {matchingKeywords.length > 10 && (
          <span className="text-xs text-gray-500">
            +{matchingKeywords.length - 10} more
          </span>
        )}
      </div>
    </div>
  );
} 