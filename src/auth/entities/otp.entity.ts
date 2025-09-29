import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
