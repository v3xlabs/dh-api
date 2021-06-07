import fastifyRef from "fastify";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";
import { ContentType, HeaderItem } from "./types/fastify-utils";

import { pullUserFromRequest, UserContext } from "./graphql-utils/pullUserFromRequest";
import shields from "./controller/shields";

import { UserResolver } from './resolvers/UserResolver';
import { buildSchemaSync } from "type-graphql";
import mercurius, { MercuriusContext, MercuriusOptions } from "mercurius";
import { RoomResolver } from "./resolvers/RoomResolver";
import { MemberResolver } from "./resolvers/MemberResolver";
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { getRoomMember, getUserRoom, leaveRoom, repair, setupCassandra } from "./service/cql";
import chalk from "chalk";
import { verify } from "jsonwebtoken";

/* Load .env variables */
require("dotenv").config();

const fastify = fastifyRef({
  logger: process.env.FASTIFY_PRODUCTION == null
    ? true
    : !!process.env.FASTIFY_PRODUCTION,
  trustProxy: true,
});

/* Routers */
fastify.register(require('fastify-cors'), {
  origin: '*'
});
fastify.register(shields, { prefix: "/shields" });

/* Healthcheck */
fastify.get("/", async (_request, reply) => {
  return reply
    .code(200)
    .header(HeaderItem.CONTENT_TYPE, ContentType.TEXT_HTML)
    .send("");
});

/* Start Server */
const start = async () => {
  try {
    await setupDB();
    await setupRedis();
    await setupCassandra();

    const pubSub = new RedisPubSub({
      connection: {
        host: process.env.REDIS_HOST
      }
    });

    fastify.register(mercurius, {
      schema: buildSchemaSync({
        resolvers: [
          UserResolver,
          RoomResolver,
          MemberResolver
        ],
        pubSub,
      }),
      context: (req, reply): UserContext => {
        const user_id = pullUserFromRequest(req.headers);

        if (user_id == null)
          throw new Error("Unauthorized");

        return {
          ...req,
          user_id
        }
      },
      graphiql: "playground",
      subscription: {
        onDisconnect: async (ctx) => {
          if (ctx['user_id']) {
            const room = await getUserRoom(ctx['user_id']);
            if (room) {
              leaveRoom(room, ctx['user_id']);
            }
          }
        },
        onConnect: (data) => {
          const user_id = pullUserFromRequest(data.payload);
          if (user_id == null)
            return {};
          return {
            user_id
          };
        },
      },
      playgroundHeaders(window: any) {
        return {
          authorization: `Bearer `,
        };
      },
    });

    setTimeout(() => {
      repair();
      setInterval(repair, 100000);
    }, 1000);

    await fastify.listen(process.env.PORT || 3000, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
