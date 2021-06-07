import { Field, Int, ObjectType, registerEnumType } from "type-graphql";
import { CQLMemberType } from "./CQLRoom";
import { Room } from "./room";
import { User } from "./user";

registerEnumType(CQLMemberType, {
    name: "Role",
    description: "Role of the user in a specific room"
});

@ObjectType()
export class Member {

    /**
     * Room
     */
    @Field(type => Room)
    room?: Room;
    @Field(type => String)
    room_id: string;

    /**
     * User
     */
    @Field(type => User)
    user?: User;
    @Field(type => String)
    user_id: string;

    /**
     * Role
     */
    @Field(type => Int)
    role: CQLMemberType;

}