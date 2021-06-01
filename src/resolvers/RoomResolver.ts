import { Args, ArgsType, Ctx, Field, FieldResolver, Int, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from "type-graphql";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { Room, RoomChangePayload, RoomID } from "../types/room";
import { User } from "../types/user";

@ArgsType()
class CreateRoomArgs {
    @Field(type => String)
    name: string;
    @Field(type => String, {nullable: true})
    description?: string;
}

@Resolver(of => Room)
export class RoomResolver {

    @Query(returns => [Room])
    async rooms(@Ctx() ctx: UserContext) {
        return await Room.find();
    }

    @Subscription(() => RoomChangePayload, {
        topics: "ROOM_CHANGE"
    })
    async roomChange(@Root() ctx: RoomChangePayload) {
        return ctx;
    }

    @Mutation(() => Room)
    async createRoom(@Ctx() ctx: UserContext, @Args() {name, description}: CreateRoomArgs, @PubSub("ROOM_CHANGE") publish: Publisher<RoomChangePayload>) {

        const room = Room.create({id: 1, name: name, description: description});

        const payload: RoomChangePayload = {
            event: 'CREATE',
            room: room
        };

        await publish(payload);

        return room;
    }

    @Mutation(() => String)
    async joinRoom(@Ctx() ctx: UserContext, @Args(()=>RoomID, {}) {room_id}: RoomID, @PubSub("ROOM_CHANGE") publish: Publisher<RoomChangePayload>) {

        // Fetch room but for now mock
        const room = Room.create({id: room_id});

        await publish({
            event: 'USER_JOIN',
            room: room,
            user: await User.findOne({id: ctx.user_id})
        });

        return 'secretvalue';
    }

    @FieldResolver()
    async members(@Ctx() ctx: UserContext) {

        return [];
    }
}