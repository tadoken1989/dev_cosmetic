import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm'
import { Product } from './product.entity'

@Entity('product_images')
@Index(['productId'])
@Index(['productId', 'isPrimary'], { where: '"isPrimary" = true' })
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'int' })
  productId: number

  @ManyToOne(() => Product, (product) => product.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product

  @Column({ type: 'varchar', length: 500 })
  url: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText: string

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean

  @CreateDateColumn()
  createdAt: Date
}

