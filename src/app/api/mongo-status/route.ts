import { NextRequest } from 'next/server';
import { MongoClient } from 'mongodb';

export async function GET() {
  try {
    // MongoDB connection URI for local instance
    const uri = 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(uri);
    
    // Test connection with a timeout
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    await client.close();
    
    return new Response(
      JSON.stringify({ status: 'connected', message: 'MongoDB is connected' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'disconnected', 
        message: 'MongoDB connection failed',
        error: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
