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
import { ProductVariant } from './product-variant.entity'

@Entity('unit_conversions')
export class UnitConversion {
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

  @Column({ type: 'varchar', length: 50 })
  unitName: string // e.g., "Thùng", "Hộp", "Chai"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  conversionRate: number // e.g., 1 Thùng = 10 Chai -> conversionRate = 10

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  retailPrice: number // Custom price for this unit

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  wholesalePrice: number

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}





