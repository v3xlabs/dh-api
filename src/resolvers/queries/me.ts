import { User } from "../../types/user";

async function me(_, { }, context) {

    const userId = context.user;

    const userFromDB = await User.find({ where: { id: userId }, take: 1, select: ["id", "username", "bio", "avatar"] });

    return userFromDB[0];
}

export default me;
