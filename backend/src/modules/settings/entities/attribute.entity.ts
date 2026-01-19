import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('attributes')
export class Attribute {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  name: string // e.g., "Kích thước", "Màu sắc", "Dung tích"

  @Column({ type: 'varchar', length: 20, default: 'text' })
  type: string // "text", "select", "number", "color"

  @Column({ type: 'text', array: true, default: [] })
  defaultValues: string[] // e.g., ["S", "M", "L", "XL"] for size

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'boolean', default: true })
  isActive: boolean

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}





