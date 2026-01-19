import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Order } from './order.entity'

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  orderId: number

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order

  @Column({ type: 'int' })
  productId: number

  @Column({ type: 'int', nullable: true })
  variantId: number

  @Column({ type: 'varchar', length: 255 })
  productName: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  sku: string

  @Column({ type: 'varchar', length: 100, nullable: true })
  variantName: string // VD: Mặc định, Size S - Màu đỏ

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string

  @Column({ type: 'int', default: 1 })
  quantity: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unitPrice: number // Đơn giá

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number // Chiết khấu trên item

  @Column({ type: 'varchar', length: 50, nullable: true })
  discountType: string // percent, fixed

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number // Thành tiền = (unitPrice - discount) * quantity

  @Column({ type: 'text', nullable: true })
  note: string

  @CreateDateColumn()
  createdAt: Date
}





