// src/app/api/db-test/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';

export async function GET() {
  try {
    const conn = await dbConnect();
    
    // Try a simple database operation
    const collections = await conn.db.listCollections().toArray();
    
    return NextResponse.json({
      connected: true,
      collections: collections.map(c => c.name),
      message: "Database connected successfully!"
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error.message,
      message: "Database connection failed!"
    }, { status: 500 });
  }
}