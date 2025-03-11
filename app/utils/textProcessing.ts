import nlp from 'compromise';

// Cache for processed text to avoid redundant processing
const processedTextCache = new Map<string, string[]>();
const MAX_CACHE_SIZE = 100;

/**
 * Preprocess text for analysis
 * - Convert to lowercase
 * - Remove HTML tags
 * - Remove special characters
 * - Tokenize
 * - Remove stop words
 * - Normalize tokens
 */
export function preprocessText(text: string): string[] {
  // Check cache first
  if (processedTextCache.has(text)) {
    return processedTextCache.get(text)!;
  }
  
  // Clean cache if it gets too large
  if (processedTextCache.size > MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(processedTextCache.keys()).slice(0, 20);
    keysToDelete.forEach(key => processedTextCache.delete(key));
  }
  
  // Convert to lowercase
  let cleanText = text.toLowerCase();
  
  // Remove HTML tags
  cleanText = cleanText.replace(/<[^>]*>/g, ' ');
  
  // Remove URLs
  cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, ' ');
  
  // Remove special characters and numbers
  cleanText = cleanText.replace(/[^\w\s]/g, ' ');
  cleanText = cleanText.replace(/\d+/g, ' ');
  
  // Use compromise for better tokenization and normalization
  const doc = nlp(cleanText);
  
  // Extract normalized terms
  const terms = doc.terms().out('array');
  
  // Filter stop words and short terms
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
    'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'to', 'from', 'in', 'out', 'on', 'off', 'over', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
    'now', 'of', 'for', 'with', 'by', 'about', 'against', 'between', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
    'that', 'this', 'these', 'those', 'am', 'im', 'your', 'his', 'her', 'their',
    'my', 'mine', 'our', 'ours', 'its', 'their', 'theirs', 'you', 'me', 'him', 'her',
    'working', 'work', 'works', 'worked', 'using', 'use', 'uses', 'used',
    'interest', 'interested', 'interesting', 'interests',
  ]);
  
  const filteredTokens = terms
    .filter((term: string) => term.length > 2 && !stopWords.has(term))
    // Normalize tokens (remove trailing 's', etc.)
    .map((term: string) => term.replace(/s$/, ''));
  
  // Store in cache
  processedTextCache.set(text, filteredTokens);
  
  return filteredTokens;
}

/**
 * Calculate similarity between two texts
 * Uses Jaccard similarity coefficient
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(preprocessText(text1));
  const tokens2 = new Set(preprocessText(text2));
  
  if (tokens1.size === 0 || tokens2.size === 0) return 0;
  
  // Calculate intersection
  const intersection = new Set([...tokens1].filter(token => tokens2.has(token)));
  
  // Calculate union
  const union = new Set([...tokens1, ...tokens2]);
  
  // Jaccard similarity coefficient
  return intersection.size / union.size;
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): string[] {
  const tokens = preprocessText(text);
  
  // Count token frequency
  const tokenCounts = new Map<string, number>();
  tokens.forEach(token => {
    tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
  });
  
  // Convert to array and sort by frequency
  return Array.from(tokenCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20) // Limit to top 20 keywords
    .map(([token]) => token);
} 