import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room extends BaseEntity {

    /**
     * Identifier
     * This is the unique room identifier
     */
    @PrimaryGeneratedColumn('increment')
    id: number;

    /**
     * Room Name
     */
    @Column({ type: 'varchar', length: 30 })
    name: string;

    /**
     * Room Description
     */
    @Column({ type: 'varchar', length: 100 })
    description: string;

}