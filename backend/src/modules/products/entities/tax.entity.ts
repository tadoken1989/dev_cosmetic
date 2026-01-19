import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('taxes')
export class Tax {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100, nullable: true, default: '' })
  name: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  code: string

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  rate: number

  @Column({ type: 'text', nullable: true })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

