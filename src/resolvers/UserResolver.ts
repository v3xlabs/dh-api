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
    async follower_count(@Root() user: User): Promise<number> {
        return (await user.followers).length;
    }

    @FieldResolver()
    async following_count(@Root() user: User): Promise<number> {
        return (await user.following).length;
    }

    @Mutation(type => Boolean)
    async follow(@Ctx() ctx: UserContext, @Args() {user_id}: FollowUserArgs) {
        const user = await User.findOne({where: {id: ctx.user_id}, relations: ['following']});
        const otherUser = await User.findOne({where: {id: user_id}});

        if (!otherUser) {
            return false;
        }

        const following = await user.following;

        if (following.some(following => following.id == otherUser.id)) {
            return true;
        }

        following.push(otherUser);
        user.following = following;

        await user.save();

        return true;
    }

    @Mutation(type => Boolean)
    async unfollow(@Ctx() ctx: UserContext, @Args() {user_id}: FollowUserArgs) {
        const user = await User.findOne({where: {id: ctx.user_id}, relations: ['following']});
        const otherUser = await User.findOne({where: {id: user_id}});

        if (!otherUser) {
            return false;
        }

        const following = await user.following;

        if (!following.some(following => following.id == otherUser.id)) {
            return true;
        }
        
        user.following = following.filter(following => following.id !== otherUser.id);

        await user.save();

        return true;
    }
}