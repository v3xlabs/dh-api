import { MiddlewareFn } from "type-graphql";
import { UserContext } from "./pullUserFromRequest";

export const useAuth: MiddlewareFn<UserContext> = ({args, context, info, root}, next) => {
    if (!context.user_id) {
        console.log('Unauthorized Request to User Endpoint');
        throw new Error('Unauthorized');
    }
    return next();
};