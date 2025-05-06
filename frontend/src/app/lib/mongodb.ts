// src/app/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB  = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}
if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable in .env.local');
}

declare global {
  // allow global caching across hot reloads in development
  var _mongo: {
    conn: { client: MongoClient; db: Db } | null;
    promise: Promise<{ client: MongoClient; db: Db }> | null;
  };
}

let cache = global._mongo;

if (!cache) {
  cache = global._mongo = { conn: null, promise: null };
}

export default async function dbConnect(): Promise<{ client: MongoClient; db: Db }> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      const db = client.db(MONGODB_DB);
      return { client, db };
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
