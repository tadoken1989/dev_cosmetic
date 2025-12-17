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
import { ProductType } from './product-type.entity'
import { Brand } from './brand.entity'
import { ProductImage } from './product-image.entity'

export enum ManagementType {
  NORMAL = 'normal',
  BATCH = 'batch',
}

@Entity('products')
@Index(['sku'], { unique: true, where: '"sku" IS NOT NULL' })
@Index(['barcode'], { unique: true, where: '"barcode" IS NOT NULL' })
@Index(['name'])
@Index(['productTypeId'])
@Index(['brandId'])
@Index(['createdAt'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255 })
  name: string

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  sku: string

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  barcode: string

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number

  @Column({ type: 'varchar', length: 10, nullable: true, default: 'g' })
  weightUnit: string

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({
    type: 'enum',
    enum: ManagementType,
    default: ManagementType.NORMAL,
  })
  managementType: ManagementType

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  retailPrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  wholesalePrice: number

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, default: 0 })
  importPrice: number

  @Column({ type: 'boolean', default: true })
  allowSale: boolean

  @Column({ type: 'boolean', default: false })
  applyTax: boolean

  @Column({ type: 'boolean', nullable: true })
  taxIncluded: boolean

  @Column({ type: 'int', nullable: true })
  inputTaxId: number

  @Column({ type: 'int', nullable: true })
  outputTaxId: number

  @Column({ type: 'boolean', default: false })
  expiryWarningEnabled: boolean

  @Column({ type: 'int', nullable: true })
  productTypeId: number

  @ManyToOne(() => ProductType, { nullable: true })
  @JoinColumn({ name: 'productTypeId' })
  productType: ProductType

  @Column({ type: 'int', nullable: true })
  brandId: number

  @ManyToOne(() => Brand, { nullable: true })
  @JoinColumn({ name: 'brandId' })
  brand: Brand

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[]

  @Column({ type: 'text', array: true, default: [] })
  tags: string[]

  @Column({ type: 'int', default: 0 })
  viewCount: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @Column({ type: 'int', nullable: true })
  createdById: number

  @Column({ type: 'int', nullable: true })
  updatedById: number
}

