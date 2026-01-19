import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { ProductsRepository } from './products.repository'
import { Product } from './entities/product.entity'
import { ProductType } from './entities/product-type.entity'
import { Brand } from './entities/brand.entity'
import { ProductImage } from './entities/product-image.entity'
import { Tax } from './entities/tax.entity'
import { Inventory } from '../inventory/entities/inventory.entity'
import { InventoryModule } from '../inventory/inventory.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductType, Brand, ProductImage, Tax, Inventory]),
    forwardRef(() => InventoryModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

