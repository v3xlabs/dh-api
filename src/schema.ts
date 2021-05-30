export default `
type Habibi {
  name: String
}

type User {
  id: Int!
  username: String!
  avatar: String!
  bio: String!
  follower_count: Int!
  following_count: Int!
}

type Room {
  id: Int!
  name: String!
  description: String!
}

type Query {
  me: User!
  rooms: [Room!]!
}

type Mutation {
  createOneHabibi(name: String): Habibi
}
`;
