import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('brand')
@Unique(['nama'])
export class Brand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  nama: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string | null;

  @Column({ type: 'text', nullable: true })
  logo: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}


