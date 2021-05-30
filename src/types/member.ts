import { Field, ID, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room";
import { User } from "./user";

type MemberType = 'VISITOR' | 'SPEAKER' | 'ADMIN';

@ObjectType()
export class Member {

    /**
     * Membertype
     */
    @Field()
    id: MemberType;

    /**
     * Room
     */
    @Field(type => Room)
    room: Room;

    /**
     * User
     */
    @Field(type => User)
    user: User;
}