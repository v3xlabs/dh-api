import { ArgsType, Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member";
import { User } from "./user";

@ObjectType()
@Entity()
export class Room extends BaseEntity {

    /**
     * Identifier
     * This is the unique room identifier
     */
    @Field(type => Int)
    @PrimaryGeneratedColumn('increment')
    id: number;

    /**
     * Room Name
     */
    @Field()
    @Column({ type: 'varchar', length: 30 })
    name: string;

    /**
     * Room Description
     */
    @Field(() => String, {nullable: true})
    @Column({ type: 'varchar', length: 100, nullable: true })
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
    event: 'CREATE' | 'UPDATE' | 'DELETE' | 'USER_JOIN' | 'USER_PART';

    @Field(type => Room)
    room: Room;

    @Field(type => User, { nullable: true })
    user?: User;

};

@ArgsType()
export class RoomID {
    @Field(type => Int)
    room_id: number;
}