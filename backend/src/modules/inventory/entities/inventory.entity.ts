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
import { Product } from '../../products/entities/product.entity'
import { ProductVariant } from '../../products/entities/product-variant.entity'

@Entity('inventory')
@Index(['productId', 'branchId'], { unique: true })
@Index(['variantId', 'branchId'])
export class Inventory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  productId: number

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'int', nullable: true })
  variantId: number

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant

  @Column({ type: 'int', default: 1 })
  branchId: number // Chi nhánh

  @Column({ type: 'varchar', length: 100, default: 'Chi nhánh mặc định' })
  branchName: string

  @Column({ type: 'int', default: 0 })
  quantity: number // Tồn kho

  @Column({ type: 'int', default: 0 })
  available: number // Có thể bán

  @Column({ type: 'int', default: 0 })
  inTransaction: number // Đang giao dịch

  @Column({ type: 'int', default: 0 })
  incoming: number // Hàng đang về

  @Column({ type: 'int', default: 0 })
  outgoing: number // Hàng đang giao

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  costPrice: number // Giá vốn

  @Column({ type: 'int', nullable: true })
  minStock: number // Tồn tối thiểu

  @Column({ type: 'int', nullable: true })
  maxStock: number // Tồn tối đa

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string // Điểm lưu kho

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}





