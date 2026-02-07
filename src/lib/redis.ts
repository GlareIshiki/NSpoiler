import { Redis } from "@upstash/redis";
import { SpoilerTheme } from "@/components/SpoilerViewer";

// Upstash Redis (本番用)
const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  : null;

// インメモリストレージ (開発用フォールバック)
const memoryStore = new Map<string, { data: string; expiresAt: number }>();

export interface SpoilerDocument {
  id: string;
  userId: string;
  content: string;
  spoilers: number[][]; // [[start, end], [start, end], ...]
  theme: SpoilerTheme;
  createdAt: number;
}

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30日
const TTL_MS = TTL_SECONDS * 1000;

export async function saveSpoiler(doc: SpoilerDocument): Promise<void> {
  const key = `spoiler:${doc.id}`;
  const value = JSON.stringify(doc);

  if (redis) {
    await redis.set(key, value, { ex: TTL_SECONDS });
  } else {
    memoryStore.set(key, {
      data: value,
      expiresAt: Date.now() + TTL_MS,
    });
    console.log("[DEV] Saved to memory store:", doc.id);
  }

  // ユーザーのドキュメントリストにも追加
  await addToUserList(doc.userId, doc.id);
}

export async function getSpoiler(id: string): Promise<SpoilerDocument | null> {
  const key = `spoiler:${id}`;

  if (redis) {
    const data = await redis.get<string>(key);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data;
  } else {
    const entry = memoryStore.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    return JSON.parse(entry.data);
  }
}

export async function deleteSpoiler(id: string): Promise<void> {
  const key = `spoiler:${id}`;

  // 削除前にドキュメントを取得してユーザーリストからも削除
  const doc = await getSpoiler(id);

  if (redis) {
    await redis.del(key);
  } else {
    memoryStore.delete(key);
    console.log("[DEV] Deleted from memory store:", id);
  }

  if (doc) {
    await removeFromUserList(doc.userId, id);
  }
}

// ユーザーごとのドキュメントリスト管理
async function addToUserList(userId: string, docId: string): Promise<void> {
  const key = `user:${userId}:spoilers`;

  if (redis) {
    await redis.sadd(key, docId);
  } else {
    const entry = memoryStore.get(key);
    const set: Set<string> = entry ? new Set(JSON.parse(entry.data)) : new Set();
    set.add(docId);
    memoryStore.set(key, {
      data: JSON.stringify([...set]),
      expiresAt: Date.now() + TTL_MS,
    });
  }
}

async function removeFromUserList(userId: string, docId: string): Promise<void> {
  const key = `user:${userId}:spoilers`;

  if (redis) {
    await redis.srem(key, docId);
  } else {
    const entry = memoryStore.get(key);
    if (entry) {
      const set: Set<string> = new Set(JSON.parse(entry.data));
      set.delete(docId);
      memoryStore.set(key, {
        data: JSON.stringify([...set]),
        expiresAt: Date.now() + TTL_MS,
      });
    }
  }
}

export async function getUserSpoilers(userId: string): Promise<SpoilerDocument[]> {
  const key = `user:${userId}:spoilers`;
  let docIds: string[] = [];

  if (redis) {
    docIds = await redis.smembers(key) as string[];
  } else {
    const entry = memoryStore.get(key);
    if (entry && Date.now() <= entry.expiresAt) {
      docIds = JSON.parse(entry.data);
    }
  }

  // 各ドキュメントを取得
  const docs: SpoilerDocument[] = [];
  for (const id of docIds) {
    const doc = await getSpoiler(id);
    if (doc) {
      docs.push(doc);
    }
  }

  // 作成日時の降順でソート
  return docs.sort((a, b) => b.createdAt - a.createdAt);
}
