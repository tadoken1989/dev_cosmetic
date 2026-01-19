import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm'
import { Order } from './order.entity'

@Entity('order_returns')
@Index(['returnCode'], { unique: true })
export class OrderReturn {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, unique: true })
  returnCode: string // VD: SRN00049

  @Column({ type: 'int' })
  orderId: number

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order

  @Column({ type: 'varchar', length: 20 })
  orderCode: string

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string // pending, received, refunded, cancelled

  // Customer
  @Column({ type: 'int', nullable: true })
  customerId: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerName: string

  // Return items (stored as JSON for simplicity)
  @Column({ type: 'jsonb', default: [] })
  items: Array<{
    productId: number
    productName: string
    sku: string
    quantity: number
    unitPrice: number
    total: number
    reason: string
  }>

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number // Tổng tiền trả hàng

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refundAmount: number // Hoàn tiền

  @Column({ type: 'boolean', default: false })
  isRefunded: boolean

  @Column({ type: 'text', nullable: true })
  reason: string // Lý do trả hàng

  @Column({ type: 'text', nullable: true })
  note: string

  @Column({ type: 'int', nullable: true })
  staffId: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  staffName: string

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date // Ngày nhận hàng

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date // Ngày hoàn tiền

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'int', nullable: true })
  createdById: number
}





