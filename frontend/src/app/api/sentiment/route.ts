import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Check if API key exists
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('Missing HUGGINGFACE_API_KEY - using fallback sentiment analysis');
      return NextResponse.json([{
        label: simpleFallbackSentiment(text),
        score: 0.75
      }]);
    }
    
    try {
      const response = await fetch("https://km3tlwj9lafd9sn0.us-east-1.aws.endpoints.huggingface.cloud", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: text,
          parameters: {}
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Sentiment API responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      return NextResponse.json(result);
    } catch (apiError) {
      // API call failed, use fallback instead of returning error
      console.error('External sentiment API error:', apiError);
      console.info('Using fallback sentiment analysis');
      
      return NextResponse.json([{
        label: simpleFallbackSentiment(text),
        score: 0.75
      }]);
    }
  } catch (error) {
    console.error('Sentiment route error:', error);
    
    // Still return a valid response format even on error
    return NextResponse.json([{
      label: "neutral",
      score: 0.5
    }], { status: 200 });
  }
}

// Simple keyword-based sentiment analyzer as fallback
function simpleFallbackSentiment(text: string): string {
  const textLower = text.toLowerCase();
  
  const positiveWords = [
    'gain', 'rise', 'up', 'surge', 'jump', 'grow', 'profit', 'success', 
    'positive', 'good', 'great', 'excellent', 'strong', 'bullish', 'opportunity',
    'beat', 'exceed', 'outperform', 'record', 'high'
  ];
  
  const negativeWords = [
    'loss', 'fall', 'down', 'drop', 'plunge', 'decline', 'decrease', 'negative',
    'bad', 'poor', 'weak', 'bearish', 'risk', 'fail', 'miss', 'below',
    'warning', 'concern', 'worry', 'trouble', 'low'
  ];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (textLower.includes(word)) positiveScore++;
  });
  
  negativeWords.forEach(word => {
    if (textLower.includes(word)) negativeScore++;
  });
  
  if (positiveScore > negativeScore) return "positive";
  if (negativeScore > positiveScore) return "negative";
  return "neutral";
}