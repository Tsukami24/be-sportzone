import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'src/users/entities/user.entity/user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id : string;

    @Column({ length: 50 })
    name : string;

    @OneToMany(() => User, (user) => user.role)
    users : User[];
}
