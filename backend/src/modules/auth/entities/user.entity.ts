import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm'
import { Exclude } from 'class-transformer'

@Entity('users')
@Index(['email'], { unique: true })
@Index(['role'])
@Index(['status'])
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string

  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  passwordHash: string

  @Column({ type: 'varchar', length: 255 })
  fullName: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 50, default: 'staff' })
  role: string

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string

  @Column({ type: 'int', nullable: true })
  branchId: number

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'int', nullable: true })
  createdById: number

  @Column({ type: 'int', nullable: true })
  updatedById: number
}

