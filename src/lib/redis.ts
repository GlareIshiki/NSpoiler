import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export interface SpoilerDocument {
  id: string;
  userId: string;
  content: string;
  spoilers: number[][]; // [[start, end], [start, end], ...]
  createdAt: number;
}

const TTL_SECONDS = 30 * 24 * 60 * 60; // 30日

export async function saveSpoiler(doc: SpoilerDocument): Promise<void> {
  await redis.set(`spoiler:${doc.id}`, JSON.stringify(doc), {
    ex: TTL_SECONDS,
  });
}

export async function getSpoiler(id: string): Promise<SpoilerDocument | null> {
  const data = await redis.get<string>(`spoiler:${id}`);
  if (!data) return null;
  return typeof data === "string" ? JSON.parse(data) : data;
}

export async function deleteSpoiler(id: string): Promise<void> {
  await redis.del(`spoiler:${id}`);
}
