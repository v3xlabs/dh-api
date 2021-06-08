import { RedisPubSub } from "graphql-redis-subscriptions";
import { Room, RoomChangePayload } from "../types/room";
import { getRoom } from "./cql";

let pubSub: RedisPubSub;

export const setupPubSub = () => {
    pubSub = new RedisPubSub({
        connection: {
            host: process.env.REDIS_HOST
        }
    });

    return pubSub;
}

export const getPubSub = () => pubSub;

export const sendRoomUpdate = async (room_id: string, room: Room) => {
    if (!room) {
        room = await getRoom(room_id);
    }
    return await getPubSub().publish("ROOM_CHANGE", {
        room_id: room_id,
        room: room
    } as RoomChangePayload);
}