import { Field, ObjectType } from "type-graphql";
import { CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@ObjectType()
@Entity()
export class Follow {
    @PrimaryGeneratedColumn()
    id: number;

    @Field(() => User, {nullable: true})
    @ManyToOne(type => User, user => user.following)
    follower: User;

    @Field(() => User, {nullable: true})
    @ManyToOne(type => User, user => user.followers)
    following: User;

    @CreateDateColumn()
    createdAt: Date;
}