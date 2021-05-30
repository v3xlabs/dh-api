async function createRoom(_, { name }, context) {
    return {
        name,
    };
}
export default createRoom;