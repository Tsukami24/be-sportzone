import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
