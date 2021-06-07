import { RedisPubSub } from "graphql-redis-subscriptions";

let pubSub: RedisPubSub;

export const setupPubSub = () => {
    pubSub = new RedisPubSub({
        connection: {
            host: process.env.REDIS_HOST
        }
    });

    return pubSub;
}

export const getPubSub = () => pubSub;