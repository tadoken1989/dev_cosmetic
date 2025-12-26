import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { ProductsRepository } from './products.repository'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFilterDto } from './dto/product-filter.dto'
import { Product } from './entities/product.entity'

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(
    createProductDto: CreateProductDto,
    userId: number,
  ): Promise<Product> {
    if (createProductDto.sku) {
      const skuExists = await this.productsRepository.existsBySku(
        createProductDto.sku,
      )
      if (skuExists) {
        throw new ConflictException('Mã SKU đã tồn tại')
      }
    }

    if (createProductDto.barcode) {
      const barcodeExists = await this.productsRepository.existsByBarcode(
        createProductDto.barcode,
      )
      if (barcodeExists) {
        throw new ConflictException('Mã vạch đã tồn tại')
      }
    }

    // Tách images ra khỏi productData vì DTO có ProductImageDto[] nhưng entity cần ProductImage[]
    const { images, ...productDataWithoutImages } = createProductDto

    const productData = {
      ...productDataWithoutImages,
      createdById: userId,
      updatedById: userId,
    }

    const product = await this.productsRepository.create(productData)
    
    // Xử lý images sau khi tạo product (nếu có)
    if (images && images.length > 0) {
      // TODO: Implement image creation logic if needed
      // For now, images will be handled separately via image upload endpoint
    }
    
    return this.productsRepository.findById(product.id)
  }

  async findAll(filters: ProductFilterDto) {
    return this.productsRepository.findAll(filters)
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findById(id)
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`)
    }
    return product
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ): Promise<Product> {
    const product = await this.findOne(id)

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const skuExists = await this.productsRepository.existsBySku(
        updateProductDto.sku,
        id,
      )
      if (skuExists) {
        throw new ConflictException('Mã SKU đã tồn tại')
      }
    }

    if (
      updateProductDto.barcode &&
      updateProductDto.barcode !== product.barcode
    ) {
      const barcodeExists = await this.productsRepository.existsByBarcode(
        updateProductDto.barcode,
        id,
      )
      if (barcodeExists) {
        throw new ConflictException('Mã vạch đã tồn tại')
      }
    }

    // Tách images ra khỏi updateProductDto vì DTO có ProductImageDto[] nhưng entity cần ProductImage[]
    const { images, ...updateDataWithoutImages } = updateProductDto

    // Tạo object mới với updatedById (không gán trực tiếp vào DTO)
    const productData = {
      ...updateDataWithoutImages,
      updatedById: userId,
    }

    // Xử lý images sau khi update product (nếu có)
    if (images && images.length > 0) {
      // TODO: Implement image update logic if needed
      // For now, images will be handled separately via image upload endpoint
    }

    return this.productsRepository.update(id, productData)
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id)
    await this.productsRepository.delete(id)
  }

  async search(query: string): Promise<Product[]> {
    if (!query || query.length < 2) {
      throw new BadRequestException('Query phải có ít nhất 2 ký tự')
    }
    return this.productsRepository.search(query)
  }
}

