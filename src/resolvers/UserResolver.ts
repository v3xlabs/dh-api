import { Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql";
import { User } from "../types/user";
import { UserContext } from '../graphql-utils/pullUserFromRequest';
import { Room } from "../types/room";

@Resolver(of => User)
export class UserResolver {

    @Query(returns => User)
    async me(@Ctx() ctx: UserContext) {

        console.log('request from ' + ctx.user_id);

        return await User.findOne({where: {id: ctx.user_id}});
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
}