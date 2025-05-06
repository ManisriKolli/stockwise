// src/app/api/watchlist/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MongoClient } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('watchlists');
    
    const watchlistItems = await collection.find({ userId }).toArray();
    await client.close();
    
    return NextResponse.json(watchlistItems || []);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { symbol, name = '' } = body;
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const client = new MongoClient(process.env.MONGODB_URI || '');
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    const collection = db.collection('watchlists');
    
    // Check if it already exists
    const existing = await collection.findOne({ userId, symbol });
    if (existing) {
      await client.close();
      return NextResponse.json({ message: 'Already in watchlist' }, { status: 200 });
    }
    
    // Add new item
    const newItem = {
      userId,
      symbol,
      name: name || symbol,
      addedAt: new Date()
    };
    
    await collection.insertOne(newItem);
    await client.close();
    
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}