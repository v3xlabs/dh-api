export enum CQLMemberType {
    LISTENER=0,
    SPEAKER=1,
    MODERATOR=2,
    OWNER=3
}

export type CQLMember = {
    room: number;
    user: number;
    role: CQLMemberType;
};