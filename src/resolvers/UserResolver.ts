import { Args, ArgsType, Ctx, Field, FieldResolver, Int, Mutation, Query, Resolver, Root } from "type-graphql";
import { User } from "../types/user";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { Room } from "../types/room";

@ArgsType()
class FollowUserArgs {
    @Field(type => Int)
    user_id: number;
}

@ArgsType()
class GetUserArgs {
    @Field(type => Int)
    user_id: number;
}

@Resolver(of => User)
export class UserResolver {

    @Query(returns => User)
    async me(@Ctx() ctx: UserContext) {
        return User.findOne({where: {id: ctx.user_id}});
    }

    @Query(returns => User)
    async user(@Args() {user_id}: GetUserArgs) {
        return User.findOne({where: {id: user_id}});
    }

    @FieldResolver()
    current_room(@Root() user: User): Room {
        console.log('Fetching room for ' + user.id);

        return Room.create({
            id: 1,
            description: '',
            name: 'RoomNAMEEE',
        });
    }

    @FieldResolver()
    follower_count(): number {
        return 0;
    }

    @FieldResolver()
    following_count(): number {
        return 0;
    }

    @Mutation(type => Boolean)
    async follow(@Ctx() ctx: UserContext, @Args() {user_id}: FollowUserArgs) {
        const user = await User.findOne({where: {id: ctx.user_id}, relations: ['following']});
        const otherUser = await User.findOne({where: {id: user_id}});

        if (!otherUser) {
            return false;
        }

        (await user.following).push(otherUser);

        await user.save();

        return true;
    }
}