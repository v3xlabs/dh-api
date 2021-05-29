import fastifyRef from "fastify";
import mercurius from "mercurius";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";
import { ContentType, HeaderItem } from "./types/fastify-utils";
import MeRouter from "./controller/me";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import schema from "./schema";

/* Load .env variables */
require("dotenv").config();

const fastify = fastifyRef({
  logger: process.env.FASTIFY_PRODUCTION == null
    ? true
    : !!process.env.FASTIFY_PRODUCTION,
  trustProxy: true,
});

const resolvers = {
  Query,
  Mutation,
};

fastify.register(mercurius, {
  schema: schema,
  resolvers,
  graphiql: "playground",
  playgroundHeaders(window: any) {
    return {
      Authorization: `Bearer none`,
    };
  },
});

/* Routers */
fastify.register(MeRouter, { prefix: "/me" });

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
    await fastify.listen(3000, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
