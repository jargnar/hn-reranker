'use client';

import { useMemo } from 'react';

interface RelevanceScoreProps {
  score: number;
  title: string;
  userBio: string;
}

export default function RelevanceScore({ score, title, userBio }: RelevanceScoreProps) {
  // Convert score to percentage for display
  const scorePercentage = useMemo(() => Math.round(score * 100), [score]);
  
  // Determine color based on score
  const scoreColor = useMemo(() => {
    if (scorePercentage >= 70) return 'bg-green-500';
    if (scorePercentage >= 40) return 'bg-yellow-500';
    return 'bg-gray-400';
  }, [scorePercentage]);
  
  // Only show tooltip if we have a user bio
  const showTooltip = userBio.length > 0;

  return (
    <div className="flex items-center">
      <div className="relative group">
        <div className="flex items-center">
          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${scoreColor} transition-all duration-300 ease-in-out`} 
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
          <span className="ml-2 text-sm font-medium">{scorePercentage}%</span>
        </div>
        
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            This story has a {scorePercentage}% relevance score based on how well it matches your interests.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract main interests from user bio
function extractInterestsFromBio(bio: string): string {
  // Simple extraction of key terms
  const terms = bio.toLowerCase()
    .split(/[.,;!?]/)
    .flatMap(sentence => sentence.split(' '))
    .filter(word => 
      word.length > 3 && 
      !['and', 'the', 'for', 'with', 'that', 'this', 'are', 'from'].includes(word)
    )
    .slice(0, 5);
  
  // Format the terms
  if (terms.length === 0) return "various topics";
  if (terms.length === 1) return terms[0];
  if (terms.length === 2) return `${terms[0]} and ${terms[1]}`;
  
  return terms.slice(0, -1).join(', ') + ', and ' + terms[terms.length - 1];
}

// Helper function to get explanation based on score
function getRelevanceExplanation(percentage: number): string {
  if (percentage >= 75) {
    return "This story is highly relevant to your interests and likely contains topics you care about.";
  } else if (percentage >= 50) {
    return "This story contains several topics that align with your interests.";
  } else if (percentage >= 25) {
    return "This story has some connection to your interests but may not be directly related.";
  } else {
    return "This story has minimal connection to your stated interests but might still be worth exploring.";
  }
} 