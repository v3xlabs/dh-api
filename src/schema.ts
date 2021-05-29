export default `
type Habibi {
  name: String
}

type Query {
  exampleQuery(name: String): String
}

type Mutation {
  createOneHabibi(name: String): Habibi
}
`;
