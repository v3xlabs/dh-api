import { FastifyRequest } from "fastify";
import { decode, verify } from "jsonwebtoken";

export type UserContext = {
  user_id: number;
};

export const pullUserFromRequest = (a: { [key: string]: string | string[] }) => {
  const token = a.authorization;

  if (!token) {
    return null;
  }

  if (typeof token !== 'string') {
    return null;
  }

  if (!verify(token.replace("Bearer ", ""), process.env.AUTH_TOKEN)) {
    return null;
  }

  return decode(token.replace("Bearer ", ""))["id"];
}
