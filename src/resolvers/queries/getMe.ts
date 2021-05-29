import { User } from "../../types/user";


async function getMe(_, { }, context) {

    const userId = context.user;
    
    const userFromDB = await User.find({ where: { id: userId }, take: 1, select: [ "id", "username", "bio", "avatar" ] });
    console.log({ userFromDB: userFromDB[0] })
    return userFromDB[0];
}

export default getMe;
