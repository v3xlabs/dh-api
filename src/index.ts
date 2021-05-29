import fastifyRef from "fastify";
import { setupDB } from "./service/database";
import { setupRedis } from "./service/redis";
import { ContentType, HeaderItem } from "./types/fastify-utils";
import MeRouter from "./controller/me";

/* Load .env variables */
require("dotenv").config();

const fastify = fastifyRef({ logger: process.env.FASTIFY_PRODUCTION == null ? true : !!process.env.FASTIFY_PRODUCTION, trustProxy: true });

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
    await fastify.listen(3000, '0.0.0.0');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
