import { Client } from 'cassandra-driver';
import { CQLMember, CQLMemberType } from '../types/CQLRoom';
import { Room } from '../types/room';
import { red } from 'chalk';

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
export const getRooms = async (select: string = 'id, name, description'): Promise<Room[]> => {
    const query = `SELECT ${select} from dogehouse_rooms.rooms`;

    const f = await connection.execute(query);

    return f.rows.map((a) => {
        return Object.assign(new Room(), a) as Room;
    });
};

/**
 * Gets the information of a specific room
 * @param room_id ID of the room in question
 */
export const getRoom = async (select: string, room_id: string): Promise<Room> => {
    const query = `SELECT ${select} from dogehouse_rooms.rooms WHERE id = ? LIMIT 1`;

    const f = await connection.execute(query, [room_id]);

    if (f.rowLength == 0)
        return null;

    return Object.assign(new Room(), f.rows[0]) as Room;
}

/**
 * Create a room
 */
export const createRoom = async (name: string, description: string, owner: number) => {
    const query = `INSERT INTO dogehouse_rooms.rooms (id, name, description, owner, state) VALUES (?, ?, ?, ?, 0)`;
    const id = generateID();

    await connection.execute(query, [id, name, description, owner]);

    const memberQuery = `INSERT INTO dogehouse_rooms.members (room, user, role) VALUES (?, ?, ?)`;

    await connection.execute(memberQuery, [id, owner, CQLMemberType.OWNER]);

    return Object.assign(new Room(), { name, description, owner, state: 0, id });
}

/**
 * Join a room
 * @param room_id ID of the room you would like to join
 * @param user_id ID of the user that should join the room
 */
export const joinRoom = async (room_id: string, user_id: number) => {

    const memberQuery = `INSERT INTO dogehouse_rooms.members (room, user, role) VALUES (?, ?, ?)`;

    await connection.execute(memberQuery, [room_id, user_id, CQLMemberType.LISTENER]);
};

/**
 * Disconnect a user from a room (inc. Kicking/Banning)
 * @param room_id ID of the room you would like to leave
 * @param user_id ID of the user that should leave
*/
export const leaveRoom = async (room_id: string, user_id: number) => {

    const memberQuery = `DELETE FROM dogehouse_rooms.members WHERE room=? AND user=?`;

    await connection.execute(memberQuery, [room_id, user_id]);

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
 * Make the specified user in question a listener again
 * (Demote)
 * @param room_id ID of the room in question
 * @param user_id ID of the user in quersion
 */
export const makeListener = async (room_id: string, user_id: number) => {

};

/**
 * Make the specified user in question a room admin
 * @param room_id ID of the room in question
 * @param user_id ID of the user in question
 */
export const makeAdmin = async (room_id: string, user_id: number) => {

};

/**
 * Get information about a specific user's current room
 * @param user_id ID of the user in question
 * @returns The ID of the room the user is in or null
 */
export const getUserRoom = async (user_id: string): Promise<string> => {
    const userQuery = `SELECT room FROM dogehouse_rooms.members WHERE user=?`;

    const f = await connection.execute(userQuery, [user_id]);

    if (f.rows.length == 0) {
        return null;
    }

    return f.rows[0].get('room');
};

/**
 * 
 */
export const getRoomMembers = async (room_id: string): Promise<CQLMember[]> => {
    const roomUserQuery = `SELECT * FROM dogehouse_rooms.members WHERE room=?`;
    const f = await connection.execute(roomUserQuery, [room_id]);

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
    const roomUserQuery = `SELECT * FROM dogehouse_rooms.members WHERE room=? and user=?`;
    const f = await connection.execute(roomUserQuery, [room_id, user_id]);

    return f.rows.map(row => {
        const mem: CQLMember = {
            role: row.get('role').toString(),
            room: parseInt(room_id),
            user: row.get('user').toString()
        };
        return mem;
    })[0];
};

// TODO: Move to seperate `queries` file
const memberQuery = `SELECT id FROM dogehouse_rooms.rooms`;
const rowQuery = `SELECT room FROM dogehouse_rooms.members WHERE room=? LIMIT 1`;
const deleteQuery = `DELETE FROM dogehouse_rooms.rooms WHERE id=?`;
/**
 * Cleanup/Repair function
 */
export const repair = async () => {
    console.log(red('[REPAIR]') + ' Commencing repair');

    const rooms = await connection.execute(memberQuery);

    for (let room of rooms.rows) {
        await repairRoom(room.get('id').toString());
    }

    console.log(red('[REPAIR]') + ' Finished Repair');
};

export const repairRoom = async (room_id: string) => {
    const r = await connection.execute(rowQuery, [room_id]);
    if (r.rowLength == 0) {
        console.log('Found empty room ' + room_id + ' DELETING...'); // TODO: Rename to better message
        await connection.execute(deleteQuery, [room_id]);
    }
}