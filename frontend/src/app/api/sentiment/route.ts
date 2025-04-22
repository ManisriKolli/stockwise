import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
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
      })
    });
    
    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Sentiment API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}