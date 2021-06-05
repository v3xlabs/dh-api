import { Args, ArgsType, Ctx, Field, FieldResolver, Int, Mutation, Query, Resolver, Root } from "type-graphql";
import { User } from "../types/user";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { Room } from "../types/room";
import { getManager, getRepository } from "typeorm";
import { Follow } from "../types/follow";

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
        const userRepository = getRepository(User);
        return userRepository.findOne({where: {id: ctx.user_id}, relations: ["following", "followers"]});
    }

    @Query(returns => User)
    async user(@Args() {user_id}: GetUserArgs) {
        const userRepository = getRepository(User);
        return userRepository.findOne({where: {id: user_id}, relations: ["following", "followers"]});
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
        if (user['followers'] != null)
            return user['followers'].length;
        const m = getManager();
        return await m.count(Follow, {where: {following: user}});
    }

    @FieldResolver()
    async following_count(@Root() user: User): Promise<number> {
        if (user['following'] != null)
            return user['following'].length;
        const m = getManager();
        return await m.count(Follow, {where: {follower: user}});
    }

    @FieldResolver()
    async following(@Root() user: User): Promise<Follow[]> {
        const m = getManager();
        const f = await m.find(Follow, {where: {follower: user}, relations: ['follower', 'following']});
        return f;
    }
    
    @FieldResolver()
    async followers(@Root() user: User): Promise<Follow[]> {
        const m = getManager();
        const f = await m.find(Follow, {where: {following: user}, relations: ['follower', 'following']});
        return f;
    }

    @FieldResolver()
    async am_following(@Root() user: User, @Ctx() ctx: UserContext) {
        console.log(ctx.user_id);
        console.log(user);
        const a =  await getRepository(Follow).find({where: {follower: await User.find({where: {id: ctx.user_id}}), following: user}});
        console.log(a);
        return false;
    }

    @Mutation(type => Boolean)
    async follow(@Ctx() ctx: UserContext, @Args() {user_id}: FollowUserArgs) {
        const m = getManager();

        const user = await m.findOne(User, {where: {id: ctx.user_id}});
        const otherUser = await m.findOne(User, {where: {id: user_id}});

        console.log(user, otherUser);

        const f = m.create(Follow, {});
        f.follower = user;
        f.following = otherUser;
        await m.save(f);

        return true;
    }

    @Mutation(type => Boolean)
    async unfollow(@Ctx() ctx: UserContext, @Args() { user_id }: FollowUserArgs) {
        const m = getManager();

        await m.delete(Follow, { where: { follower: ctx.user_id, following: user_id  } });
        
        return true;
    }

}