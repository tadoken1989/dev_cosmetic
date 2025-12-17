import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { ProductsRepository } from './products.repository'
import { Product } from './entities/product.entity'
import { ProductType } from './entities/product-type.entity'
import { Brand } from './entities/brand.entity'
import { ProductImage } from './entities/product-image.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductType, Brand, ProductImage]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService],
})
export class ProductsModule {}

