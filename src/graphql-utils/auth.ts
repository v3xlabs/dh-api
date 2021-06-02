import { MiddlewareFn } from "type-graphql";

export const useAuth: MiddlewareFn = ({args, context, info, root}, next) => {
    return next();
};