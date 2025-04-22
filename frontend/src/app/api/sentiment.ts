import { NextApiRequest, NextApiResponse } from 'next';

type SentimentResponse = {
  label: string;
  score: number;
}[];

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  
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
      })
    });
    
    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.status}`);
    }
    
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    console.error('Sentiment API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}