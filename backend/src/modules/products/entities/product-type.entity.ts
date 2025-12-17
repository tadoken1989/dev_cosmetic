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

@Entity('product_types')
@Index(['name'])
@Index(['parentId'])
export class ProductType {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string

  @Column({ type: 'text', nullable: true })
  description: string

  @Column({ type: 'int', nullable: true })
  parentId: number

  @ManyToOne(() => ProductType, (type) => type.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: ProductType

  @OneToMany(() => ProductType, (type) => type.parent)
  children: ProductType[]

  @Column({ type: 'int', default: 0 })
  sortOrder: number

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

