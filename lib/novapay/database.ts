/**
 * NovaPay Database Operations
 * MongoDB collections and operations for NovaPay payment flows
 */

import { Collection } from 'mongodb';
import { connectToDatabase } from '../db/mongodb';
import { NovapayFlow, IdempotencyRecord } from './types';

/**
 * Get the NovaPay flows collection
 */
export async function getNovapayFlowsCollection(): Promise<Collection<NovapayFlow>> {
  const db = await connectToDatabase();
  return db.collection<NovapayFlow>('novapayFlows');
}

/**
 * Get the idempotency records collection
 */
export async function getIdempotencyCollection(): Promise<Collection<IdempotencyRecord>> {
  const db = await connectToDatabase();
  return db.collection<IdempotencyRecord>('novapayIdempotency');
}

// Flow Operations

/**
 * Create a new NovaPay flow
 */
export async function createNovapayFlow(flow: NovapayFlow): Promise<NovapayFlow> {
  const collection = await getNovapayFlowsCollection();
  await collection.insertOne(flow);
  return flow;
}

/**
 * Get a flow by its ID
 */
export async function getNovapayFlowById(flowId: string): Promise<NovapayFlow | null> {
  const collection = await getNovapayFlowsCollection();
  return await collection.findOne({ flowId });
}

/**
 * Get flows by merchant ID
 */
export async function getNovapayFlowsByMerchantId(merchantId: string): Promise<NovapayFlow[]> {
  const collection = await getNovapayFlowsCollection();
  return await collection.find({ merchantId }).sort({ createdAt: -1 }).toArray();
}

/**
 * Update a flow
 */
export async function updateNovapayFlow(flowId: string, updates: Partial<NovapayFlow>): Promise<NovapayFlow | null> {
  const collection = await getNovapayFlowsCollection();
  const result = await collection.findOneAndUpdate(
    { flowId },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result ?? null;
}

/**
 * Get expired flows (for cleanup/auto-void)
 */
export async function getExpiredHeldFlows(): Promise<NovapayFlow[]> {
  const collection = await getNovapayFlowsCollection();
  const now = new Date().toISOString();
  return await collection.find({
    state: 'HELD',
    expiresAt: { $lt: now }
  }).toArray();
}

// Idempotency Operations

/**
 * Get an idempotency record
 */
export async function getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null> {
  const collection = await getIdempotencyCollection();
  const record = await collection.findOne({ key });
  
  // Check if expired
  if (record && new Date(record.expiresAt) < new Date()) {
    await collection.deleteOne({ key });
    return null;
  }
  
  return record;
}

/**
 * Create an idempotency record
 */
export async function createIdempotencyRecord(record: IdempotencyRecord): Promise<IdempotencyRecord> {
  const collection = await getIdempotencyCollection();
  await collection.insertOne(record);
  return record;
}

/**
 * Clean up expired idempotency records
 */
export async function cleanupExpiredIdempotencyRecords(): Promise<number> {
  const collection = await getIdempotencyCollection();
  const now = new Date().toISOString();
  const result = await collection.deleteMany({ expiresAt: { $lt: now } });
  return result.deletedCount;
}
