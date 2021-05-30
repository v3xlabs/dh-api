import { FastifyRequest, FastifyReply } from "fastify";
import { decode, verify } from "jsonwebtoken";

export type UserContext = {
  user_id: number;
};

export const pullUserFromRequest = (a: FastifyRequest, next: FastifyReply) => {

  try {
    const token = a.headers.authorization;

    if (!verify(token.replace("Bearer ", ""), process.env.AUTH_TOKEN)) {
      return null;
    }

    return decode(token.replace("Bearer ", ""))["id"];
  } catch (error) {
    console.log(error);
    return null;
  }
}
