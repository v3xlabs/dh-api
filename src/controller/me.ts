import { getParsedCommandLineOfConfigFile } from "typescript";
import { dataFetchUser } from "../service/database";
import { Authorize } from "./auth";

export default function (fastify, _opts, next) {

  /*
  *  /
  *  Send the user to discord
  */
  fastify.get("/", Authorize(async (request, reply) => {
    const user = await dataFetchUser(request['user_id']);

    return reply.send(JSON.stringify(user));
  }));

  next();
}
