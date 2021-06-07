import { Client } from 'cassandra-driver';
import { CQLMember, CQLMemberType } from '../types/CQLRoom';
import { Room } from '../types/room';
import { red } from 'chalk';
import { CQLQueries } from '../types/CQLQueries';

let connection: Client;

const generateID = (): number => new Date().getTime() - parseInt(process.env.DOGE_EPOCH);

/**
 * Setup the connection to the ScyllaDB
 */
export const setupCassandra = () => {
    connection = new Client({
        contactPoints: ['127.0.0.1:9042'],
        localDataCenter: 'datacenter1',
        keyspace: 'dogehouse_rooms',
        queryOptions: {
            prepare: true,
            isIdempotent: true
        }
    });
};

/**
 * Get a list of all rooms
 * @returns a list of rooms
 */
export const getRooms = async (): Promise<Room[]> => {
    const f = await connection.execute(CQLQueries.selectRooms);

    return f.rows.map((a) => {
        return Object.assign(new Room(), a) as Room;
    });
};

/**
 * Gets the information of a specific room
 * @param room_id ID of the room in question
 */
export const getRoom = async (room_id: string): Promise<Room> => {
    const f = await connection.execute(CQLQueries.selectRoom, [room_id]);

    if (f.rowLength == 0)
        return null;

    return Object.assign(new Room(), f.rows[0]) as Room;
}

/**
 * Create a room
 */
export const createRoom = async (name: string, description: string, owner: number) => {
    const id = generateID();

    await connection.execute(CQLQueries.insertRoom, [id, name, description, owner]);
    await connection.execute(CQLQueries.insertUser, [id, owner, CQLMemberType.OWNER]);

    return Object.assign(new Room(), { name, description, owner, state: 0, id });
}

/**
 * Join a room
 * @param room_id ID of the room you would like to join
 * @param user_id ID of the user that should join the room
 */
export const joinRoom = async (room_id: string, user_id: number) => {
    await connection.execute(CQLQueries.insertUser, [room_id, user_id, CQLMemberType.LISTENER]);
};

/**
 * Disconnect a user from a room (inc. Kicking/Banning)
 * @param room_id ID of the room you would like to leave
 * @param user_id ID of the user that should leave
*/
export const leaveRoom = async (room_id: string, user_id: number) => {
    await connection.execute(CQLQueries.deleteMember, [room_id, user_id]);

    await repairRoom(room_id);
};

/**
 * Make the specified user a speaker in the room
 * @param room_id ID of the room in question
 * @param user_id ID of user in question
 */
export const setRole = async (room_id: string, user_id: number, role: CQLMemberType) => {
    const memberQuery = `UPDATE dogehouse_rooms.members SET role=? WHERE room_id=? AND user=?`;

    await connection.execute(memberQuery, [role, room_id, user_id]);
};

/**
 * Get information about a specific user's current room
 * @param user_id ID of the user in question
 * @returns The ID of the room the user is in or null
 */
export const getUserRoom = async (user_id: string): Promise<string> => {
    const f = await connection.execute(CQLQueries.selectRoomWithUser, [user_id]);

    if (f.rows.length == 0) {
        return null;
    }

    return f.rows[0].get('room');
};

/**
 * 
 */
export const getRoomMembers = async (room_id: string): Promise<CQLMember[]> => {
    const f = await connection.execute(CQLQueries.selectMembersWhereRoom, [room_id]);

    return f.rows.map(row => {
        const mem: CQLMember = {
            role: row.get('role').toString(),
            room: parseInt(room_id),
            user: row.get('user').toString()
        };
        return mem;
    });
};

/**
 * Get the Member In the Room of the User
 */
 export const getRoomMember = async (room_id: string, user_id: string): Promise<CQLMember> => {
    const f = await connection.execute(CQLQueries.selectMembersWhereRoomAndUser, [room_id, user_id]);

    return f.rows.map(row => {
        const mem: CQLMember = {
            role: row.get('role').toString(),
            room: parseInt(room_id),
            user: row.get('user').toString()
        };
        return mem;
    })[0];
};

/**
 * Cleanup/Repair function
 */
export const repair = async () => {
    console.log(red('[REPAIR]') + ' Commencing repair');

    const rooms = await connection.execute(CQLQueries.selectIdFromRooms);

    for (let room of rooms.rows) {
        await repairRoom(room.get('id').toString());
    }

    console.log(red('[REPAIR]') + ' Finished Repair');
};

export const repairRoom = async (room_id: string) => {
    const r = await connection.execute(CQLQueries.hasUserInRoom, [room_id]);
    if (r.rowLength == 0) {
        console.log('Found empty room ' + room_id + ' DELETING...'); // TODO: Rename to better message
        await connection.execute(CQLQueries.deleteRoom, [room_id]);
    }
}