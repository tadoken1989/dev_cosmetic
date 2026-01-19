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

@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  productId: number

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'varchar', length: 100 })
  name: string // e.g., "Kích thước", "Màu sắc", "Chất liệu"

  @Column({ type: 'text', array: true, default: [] })
  values: string[] // e.g., ["S", "M", "L", "XL"] or ["Đỏ", "Xanh", "Vàng"]

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}





