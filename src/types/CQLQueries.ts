export const CQLQueries = {
    selectMembersWhereRoom: `SELECT * FROM dogehouse_rooms.members WHERE room=?`,
    selectMembersWhereRoomAndUser: `SELECT * FROM dogehouse_rooms.members WHERE room=? and user=?`,
    selectIdFromRooms: `SELECT id FROM dogehouse_rooms.rooms`,
    hasUserInRoom: `SELECT room FROM dogehouse_rooms.members WHERE room=? LIMIT 1`,
    deleteRoom: `DELETE FROM dogehouse_rooms.rooms WHERE id=?`,
    selectRoomWithUser: `SELECT room FROM dogehouse_rooms.members WHERE user=?`,
    deleteMember: `DELETE FROM dogehouse_rooms.members WHERE room=? AND user=?`,
    insertUser: `INSERT INTO dogehouse_rooms.members (room, user, role) VALUES (?, ?, ?)`,
    insertRoom: `INSERT INTO dogehouse_rooms.rooms (id, name, description, owner, state) VALUES (?, ?, ?, ?, 0)`,
    selectRoom: `SELECT * from dogehouse_rooms.rooms WHERE id = ? LIMIT 1`,
    selectRooms: `SELECT * from dogehouse_rooms.rooms`
};