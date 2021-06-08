import { Arg, Args, ArgsType, Ctx, Field, FieldResolver, Info, Int, Mutation, Publisher, PubSub, Query, Resolver, Root, Subscription } from "type-graphql";
import { getManager } from "typeorm";
import { Assert, AssertNot } from "../graphql-utils/assert";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { createRoom, getRoom, getRooms, getUserRoom, getRoomMembers, joinRoom, leaveRoom } from "../service/cql";
import { Member } from "../types/member";
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

    /**
     * List All Rooms Endpoint
     */
    @Query(returns => [Room])
    async rooms(@Ctx() ctx: UserContext): Promise<Room[]> {
        return await getRooms();
    }

    /**
     * List Specific Room Endpoint
     */
    @Query(returns => Room)
    async room(@Ctx() ctx: UserContext, @Arg('room_id') room_id: string): Promise<Room> {
        return await getRoom(room_id);
    }

    @Subscription(() => RoomChangePayload, {
        topics: "ROOM_CHANGE"
    })
    async roomChange(@Root() ctx: RoomChangePayload) {
        return ctx;
    }

    /**
     * Create Room Endpoint
     */
    @Mutation(() => Room)
    async createRoom(@Ctx() ctx: UserContext, @Args() {name, description}: CreateRoomArgs, @PubSub("ROOM_CHANGE") publish: Publisher<RoomChangePayload>) {

        // Get the room the current user is in
        const userCurrentRoom = await getUserRoom(ctx.user_id.toString());

        // If user is already in a room
        Assert`${userCurrentRoom} User Already In Room`;

        // Create a new room instance and store it in DB
        const room = await createRoom(name, description, ctx.user_id);

        // Create payload to send to subscribers
        const subscriptionPayload: RoomChangePayload = {
            event: 'CREATE',
            room: room,
            room_id: room.id
        };

        // Notify everyone on the main page
        await publish(subscriptionPayload);

        // Return the new instance of a room
        return room;
    }

    /**
     * Join Room Endpoint
     */
    @Mutation(() => Boolean)
    async joinRoom(@Ctx() ctx: UserContext, @Arg('room_id') room_id: string, @PubSub("ROOM_CHANGE") publishRooms: Publisher<RoomChangePayload>, @PubSub("ROOM_USERS") publishUsers: Publisher<RoomChangePayload>) {

        // Check if you are already in a room
        const userCurrentRoom = await getUserRoom(ctx.user_id.toString());

        if (userCurrentRoom == room_id) {
            return true;
        }

        if (userCurrentRoom) {
            await leaveRoom(userCurrentRoom, ctx.user_id);
            let room = await getRoom(userCurrentRoom);
            AssertNot`${room} Room ${userCurrentRoom} does not exist`;
            await publishRooms({
                event: 'UPDATE',
                room_id: userCurrentRoom,
                room: room
            });
        }

        // Check if the room specified exists
        let room = await getRoom(room_id);
        AssertNot`${room} Room ${room_id} does not exist`;

        // Join specified room
        await joinRoom(room_id, ctx.user_id);
        room = await getRoom(room_id);

        // Publish event to room
        await publishRooms({
            event: 'UPDATE',
            room_id: room_id,
            room: room
        });

        return true;
    }

    /**
     * Leave Room Endpoint
     */
    @Mutation(() => Boolean)
    async leaveRoom(@Ctx() ctx: UserContext, @PubSub("ROOM_CHANGE") publishRooms: Publisher<RoomChangePayload>, @PubSub("ROOM_USERS") publishUsers: Publisher<RoomChangePayload>) {

        const room_id = await getUserRoom(ctx.user_id.toString());
        if (!room_id) {
            console.log('User not in a room');
            return true;
        }
        console.log('Removing user from room');

        await leaveRoom(room_id, ctx.user_id);

        const room = await getRoom(room_id);

        publishRooms({
            event: 'UPDATE',
            room,
            room_id
        })

        return true;
    }

    /**
     * List All Members
     */
    @FieldResolver()
    async members(@Ctx() ctx: UserContext, @Root() room: Room): Promise<Member[]> {
        const cqlMembers = await getRoomMembers(room.id);

        return cqlMembers.map((e) => ({
            role: e.role,
            room_id: e.room.toString(),
            user_id: e.user.toString()
        }));
    }
}