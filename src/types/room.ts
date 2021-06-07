import { ArgsType, Field, ID, Int, ObjectType } from "type-graphql";
import { Member } from "./member";
import { User } from "./user";

@ObjectType()
export class Room {

    /**
     * Identifier
     * This is the unique room identifier
     */
    @Field(type => String)
    id: string;

    /**
     * Room Name
     */
    @Field()
    name: string;

    /**
     * Room Description
     */
    @Field(() => String, {nullable: true})
    description: string;

    /**
     * Members in Room
     * Calculated field
     */
    @Field(type => [Member])
    members: Member[];
}

@ObjectType()
export class RoomChangePayload {

    @Field()
    event: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPDATE';

    @Field(type => Room, { nullable: true })
    room?: Room;

    @Field(type => String, { nullable: true })
    room_id?: string;

};

@ArgsType()
export class RoomID {
    @Field(type => Int)
    room_id: number;
}