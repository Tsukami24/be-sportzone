import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity/role.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    role_id: string;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({name: 'role_id'})
    role: Role;

    @Column( {length: 50} )
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;
}