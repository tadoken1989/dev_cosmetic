import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'
import { Product } from './product.entity'

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  productId: number

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  sku: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string

  @Column({ type: 'varchar', length: 255 })
  name: string // e.g., "S - Đỏ", "M - Xanh"

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, string> // e.g., { "Kích thước": "S", "Màu sắc": "Đỏ" }

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  retailPrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  wholesalePrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  importPrice: number

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}





