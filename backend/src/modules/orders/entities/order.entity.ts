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
import { OrderItem } from './order-item.entity'

@Entity('orders')
@Index(['orderCode'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 20, unique: true })
  orderCode: string // VD: SON02184

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string // pending, confirmed, packing, shipping, delivered, cancelled

  @Column({ type: 'varchar', length: 20, default: 'unpaid' })
  paymentStatus: string // unpaid, partial, paid

  // Customer info
  @Column({ type: 'int', nullable: true })
  customerId: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  customerName: string

  @Column({ type: 'varchar', length: 20, nullable: true })
  customerPhone: string

  @Column({ type: 'text', nullable: true })
  customerAddress: string

  // Branch/Location
  @Column({ type: 'int', default: 1 })
  branchId: number

  @Column({ type: 'varchar', length: 100, default: 'Chi nhánh mặc định' })
  branchName: string

  // Staff
  @Column({ type: 'int', nullable: true })
  staffId: number

  @Column({ type: 'varchar', length: 100, nullable: true })
  staffName: string

  // Order source
  @Column({ type: 'varchar', length: 50, default: 'Web' })
  source: string // Web, POS, Shopee, Lazada, etc.

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number // Tổng tiền hàng

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number // Chiết khấu

  @Column({ type: 'varchar', length: 50, nullable: true })
  discountType: string // percent, fixed

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingFee: number // Phí giao hàng

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total: number // Khách phải trả

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paidAmount: number // Khách đã trả

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  remainingAmount: number // Còn phải trả

  // Shipping
  @Column({ type: 'varchar', length: 50, nullable: true })
  shippingMethod: string // carrier, self, pickup, later

  @Column({ type: 'varchar', length: 100, nullable: true })
  shippingCarrier: string // Tên hãng vận chuyển

  @Column({ type: 'varchar', length: 50, nullable: true })
  trackingCode: string // Mã vận đơn

  @Column({ type: 'timestamp', nullable: true })
  expectedDeliveryDate: Date // Hẹn giao

  // Packaging
  @Column({ type: 'varchar', length: 50, nullable: true })
  packagingCode: string // Mã đóng gói

  @Column({ type: 'varchar', length: 20, nullable: true })
  packagingStatus: string // pending, packed, shipped, cancelled

  @Column({ type: 'jsonb', nullable: true, default: [] })
  packagingHistory: Array<{
    code: string
    status: string
    method: string
    date: string
  }> // Lịch sử đóng gói

  // Notes
  @Column({ type: 'text', nullable: true })
  note: string // Ghi chú đơn hàng

  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  // Relations
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[]

  // Timestamps
  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  confirmedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  packingAt: Date

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date

  @Column({ type: 'timestamp', nullable: true })
  shippedAt: Date

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date

  @Column({ type: 'int', nullable: true })
  createdById: number

  @Column({ type: 'int', nullable: true })
  updatedById: number
}





