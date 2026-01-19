import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerCode: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string

  @Column({ type: 'text', nullable: true })
  address: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  ward: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string

  @Column({ type: 'date', nullable: true })
  birthday: Date

  @Column({ type: 'varchar', length: 50, nullable: true, default: 'retail' })
  type: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  customerGroup: string

  @Column({ type: 'text', nullable: true })
  note: string

  @Column({ type: 'int', nullable: true, default: 0 })
  totalOrders: number

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, default: 0 })
  totalSpent: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  debt: number

  @Column({ type: 'int', nullable: true, default: 0 })
  loyaltyPoints: number

  @Column({ type: 'boolean', nullable: true, default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  lastOrderAt: Date
}
