import fastifyRef from "fastify";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";
import { ContentType, HeaderItem } from "./types/fastify-utils";

import {pullUserFromRequest, UserContext} from "./graphql-utils/pullUserFromRequest";
import shields from "./controller/shields";

import {UserResolver} from './resolvers/UserResolver';
import { buildSchemaSync } from "type-graphql";
import mercurius from "mercurius";
import { RoomResolver } from "./resolvers/RoomResolver";
import { MemberResolver } from "./resolvers/MemberResolver";

/* Load .env variables */
require("dotenv").config();

const fastify = fastifyRef({
  logger: process.env.FASTIFY_PRODUCTION == null
    ? true
    : !!process.env.FASTIFY_PRODUCTION,
  trustProxy: true,
});

fastify.register(mercurius, {
  schema: buildSchemaSync({
    resolvers: [
      UserResolver,
      RoomResolver,
      MemberResolver
    ]
  }),
  context: (req, reply): UserContext => {
    return {
      ...req,
      user_id: pullUserFromRequest(req, reply)
    }
  },
  graphiql: "playground",
  playgroundHeaders(window: any) {
    return {
      authorization: `Bearer `,
    };
  },
});

/* Routers */
fastify.register(require('fastify-cors'), {
  origin: '*'
});
fastify.register(shields, {prefix: "/shields"});

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

    await fastify.listen(process.env.PORT || 3000, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
