import { decode, verify } from "jsonwebtoken";

export default function pullUserFromRequest(req) {
  try {
    const token = req.headers.authorization;

    if (!verify(token.replace("Bearer ", ""), process.env.AUTH_TOKEN)) {
      return null;
    }

    return decode(token.replace("Bearer ", ""))["id"];
  } catch (error) {
    console.log(error);
    return null;
  }
}
