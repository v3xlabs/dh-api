import { Field, ID, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { Member } from "./member";

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
    @Field()
    @Column({ type: 'varchar', length: 100 })
    description: string;

    /**
     * Members in Room
     * Calculated field
     */
    @Field(type => [Member])
    members: Member[];
}