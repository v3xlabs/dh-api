import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./room";
import { SocialID } from "./social";

@ObjectType()
export abstract class PartialUser extends BaseEntity {

    /**
     * Username
     * This is changable by the end user and should not be used as an identifier.
     */
    @Field()
    @Column({ type: 'varchar', length: 8 })
    username: string = 'Anonymous';

    /**
     * User Avatar URL
     * This is changable by the end user and should not be used as an identifier.
     */
    @Field()
    @Column({ type: 'varchar', length: 200 })
    avatar: string;

    /**
     * Biography
     * This is changable by the end user and should not be used as an identifier.
     */
    @Field()
    @Column({ type: 'varchar', length: 200 })
    bio: string = 'Hello Dogehouse';
}

@ObjectType()
@Entity()
export class User extends PartialUser {

    /**
     * Identifier
     * This is the unique user identifier
     */
    @Field(type => Int)
    @PrimaryGeneratedColumn('increment')
    id: number;

    /**
     * Socials
     * This is a list of platforms that the user is connected with
     */
    @OneToMany(type => SocialID, socialID => socialID.user)
    socials: SocialID[];

    /**
     * Current Room
     * Random
     */
    @Field(type => Room, {nullable: true})
    current_room: Room;

    @Field(type => Int)
    follower_count: number;

    @Field(type => Int)
    following_count: number;

    @Field(type => [User])
    @JoinTable()
    @ManyToMany(type => User, user => user.followers, {lazy: true})
    following: Promise<User[]> | User[];

    @Field(type => [User])
    @ManyToMany(type => User, user => user.following, {lazy: true})
    followers: Promise<User[]> | User[];
};