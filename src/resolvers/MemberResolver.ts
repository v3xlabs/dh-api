import { Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { Member } from "../types/member";
import { User } from "../types/user";

@Resolver(of => Member)
export class MemberResolver {

    @FieldResolver()
    async user() {
        return User.findOne({});
    }

}