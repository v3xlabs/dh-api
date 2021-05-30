import fastifyRef from "fastify";
import mercurius from "mercurius";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";
import { ContentType, HeaderItem } from "./types/fastify-utils";
import Query from "./resolvers/Query";
import Mutation from "./resolvers/Mutation";
import schemaFile from "./schema";

import { makeExecutableSchema } from "@graphql-tools/schema";
import pullUserFromRequest from "./graphql-utils/pullUserFromRequest";
import { applyMiddleware } from "graphql-middleware";
import permissions from "./graphql-utils/permissions";
import shields from "./controller/shields";

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

const schema = makeExecutableSchema({ typeDefs: schemaFile, resolvers });

const schemaWithMiddleware = applyMiddleware(schema, permissions);

fastify.register(mercurius, {
  schema: schemaWithMiddleware,
  graphiql: "playground",
  playgroundHeaders(window: any) {
    return {
      authorization: `Bearer `,
    };
  },
  context: (req) => ({
    ...req,
    user: pullUserFromRequest(req),
  }),
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
    await fastify.listen(3000, "0.0.0.0");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
