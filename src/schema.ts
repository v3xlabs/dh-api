export default `
type Habibi {
  name: String
}

type Member {
  role: String!
  room: Room!
  user: User!
}

type User {
  id: Int!
  username: String!
  avatar: String!
  bio: String!
  follower_count: Int!
  following_couint: Int!
  current_room: Room
  friends: [User]
}

type Room {
  id: Int!
  name: String!
  description: String!
  members: [Member]
}

type Query {
  me: User!
  rooms: [Room!]!
}

type Mutation {
  createOneHabibi(name: String): Habibi
  createRoom(name: String): Room
}
`;
