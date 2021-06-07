import { FieldResolver, Resolver, Root } from "type-graphql";
import { getRoom } from "../service/cql";
import { Member } from "../types/member";
import { Room } from "../types/room";
import { User } from "../types/user";

@Resolver(of => Member)
export class MemberResolver {

    @FieldResolver()
    async user(@Root() member: Member): Promise<User> {
        return User.findOne({ where: { id: parseInt(member.user_id) } });
    }

    @FieldResolver()
    async room(@Root() member: Member): Promise<Room> {
        return getRoom(member.room_id);
    }

}