'use client';

import { useMemo } from 'react';
import { preprocessText } from '../utils/clientTextProcessing';

interface KeywordDisplayProps {
  bio: string;
  maxKeywords?: number;
}

export default function KeywordDisplay({ bio, maxKeywords = 15 }: KeywordDisplayProps) {
  const keywords = useMemo(() => {
    if (!bio.trim()) return [];
    
    // Extract keywords from the bio
    const tokens = preprocessText(bio);
    
    // Count token frequency
    const tokenCounts = new Map<string, number>();
    tokens.forEach(token => {
      if (token.length < 3) return; // Skip very short tokens
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });
    
    // Convert to array and sort by frequency
    return Array.from(tokenCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([token]) => token);
  }, [bio, maxKeywords]);

  if (keywords.length === 0) return null;

  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-2">Keywords from your bio:</p>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, index) => (
          <span 
            key={index}
            className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded-full"
          >
            {keyword}
          </span>
        ))}
      </div>
    </div>
  );
} 