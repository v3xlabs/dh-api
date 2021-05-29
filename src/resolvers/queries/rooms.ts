import { Room } from "../../types/room";

async function allRooms(_, { }, context) {
    return Room.find({});
}

export default allRooms;
