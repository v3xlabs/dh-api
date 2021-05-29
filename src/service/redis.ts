import { createClient, RedisClient } from "redis";

let client: RedisClient = null;

export async function setupRedis(): Promise<void> {
    return new Promise<void>((acc, rej) => {
        client = createClient({
            host: process.env.REDIS_HOST
        });
        client.on('ready', () => {
            acc();
        });
    });
}