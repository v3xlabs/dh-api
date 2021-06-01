import { PartialUser, User } from "../types/user";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "typeorm";
import { SocialID } from "../types/social";
import { Room } from "../types/room";
import { Follow } from "../types/follow";

export async function setupDB() {
  const connection = await createConnection({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: "dogehouse",
    username: "postgres",
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User, SocialID, Room, Follow],
    logging: true
  });
}

/**
 * Fetch the user by its social_id
 * @param user_id Person's username
 * @returns 
 */
export async function dataFetchUser(
  user_id: string
): Promise<User> {
  let users = await User.find({
    where: { id: user_id }
  });

  if (users.length == 0) {
    return null;
  }

  return users[0];
}
