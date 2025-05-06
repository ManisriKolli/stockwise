// src/app/api/watchlist/[symbol]/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';

export async function DELETE(
  request: Request, 
  { params }: { params: { symbol: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { symbol } = params;
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('watchlists');
    
    const result = await collection.deleteOne({ userId, symbol });
    await client.close();
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}