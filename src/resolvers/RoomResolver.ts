import { Ctx, Field, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { Room } from "../types/room";

@Resolver(of => Room)
export class RoomResolver {

    @Query(returns => [Room])
    async rooms(@Ctx() ctx: UserContext) {

        return await Room.find();
    }

    @FieldResolver()
    async members(@Ctx() ctx: UserContext) {

        return [];
    }
}