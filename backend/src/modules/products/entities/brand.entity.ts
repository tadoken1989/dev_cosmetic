import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm'

@Entity('brands')
@Index(['name'])
export class Brand {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

