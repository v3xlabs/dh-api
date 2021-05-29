import { not, shield } from "graphql-shield";
import { isAuthenticated } from "./rules";

const permissions = shield({
  Query: {
    me: isAuthenticated,
    rooms: not(isAuthenticated)
  },
  Mutation: {
    createOneHabibi: isAuthenticated,
  },
});

export default permissions;
