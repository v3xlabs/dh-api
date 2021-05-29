export default `
type Habibi {
  name: String
}

type PublicUser {
  id: Int!
  username: String!
  avatar: String!
  bio: String!
}

type Query {
  exampleQuery(name: String): String
  getMe: PublicUser!
}

type Mutation {
  createOneHabibi(name: String): Habibi
}
`;
