import { Collection } from 'mongodb';
import dbConnect from '../lib/mongodb';

export interface WatchlistItem {
  email: string;
  symbol: string;
  name?: string;
  addedAt: Date;
}

let watchlistCollection: Collection<WatchlistItem>;

async function getWatchlistCollection(): Promise<Collection<WatchlistItem>> {
  if (watchlistCollection) {
    return watchlistCollection;
  }
  
  const { db } = await dbConnect();
  watchlistCollection = db.collection<WatchlistItem>('watchlists');
  
  // ensure indexes
  await watchlistCollection.createIndex({ email: 1 });
  await watchlistCollection.createIndex(
    { email: 1, symbol: 1 },
    { unique: true }
  );
  
  return watchlistCollection;
}

const Watchlist = {
  async findByEmail(email: string): Promise<WatchlistItem[]> {
    const coll = await getWatchlistCollection();
    return coll.find({ email }).sort({ addedAt: -1 }).toArray();
  },
  
  async findOne(email: string, symbol: string): Promise<WatchlistItem | null> {
    const coll = await getWatchlistCollection();
    return coll.findOne({ email, symbol });
  },
  
  async add(item: WatchlistItem) {
    const coll = await getWatchlistCollection();
    return coll.insertOne({
      ...item,
      addedAt: item.addedAt || new Date()
    });
  },
  
  async findOneAndDelete(query: { email: string; symbol: string }) {
    const coll = await getWatchlistCollection();
    return coll.findOneAndDelete(query);
  }
};

export default Watchlist;
