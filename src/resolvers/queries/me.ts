import { User } from "../../types/user";

async function me(_, { }, context) {

    const userId = context.user;

    const userFromDB = await User.find({ where: { id: userId }, take: 1, select: ["id", "username", "bio", "avatar"] });

    // Hardcoded until implemented
    userFromDB[0]['follower_count'] = 0;
    userFromDB[0]['following_count'] = 0;

    return userFromDB[0];
}

export default me;
