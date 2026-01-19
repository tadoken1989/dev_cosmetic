import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common'
import { ProductsRepository } from './products.repository'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFilterDto } from './dto/product-filter.dto'
import { Product } from './entities/product.entity'
import { InventoryService } from '../inventory/inventory.service'

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    @Inject(forwardRef(() => InventoryService))
    private readonly inventoryService: InventoryService,
  ) {}

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
      await this.productsRepository.createProductImages(product.id, images)
    }
    
    return this.productsRepository.findById(product.id)
  }

  async findAll(filters: ProductFilterDto) {
    const result = await this.productsRepository.findAll(filters)
    
    // Map imageUrl from first image for easier frontend access
    if (result.data) {
      result.data = result.data.map(product => ({
        ...product,
        imageUrl: product.images?.[0]?.url || null
      }))
    }
    
    return result
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findById(id)
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID ${id}`)
    }
    
    // Map imageUrl from first image
    return {
      ...product,
      imageUrl: product.images?.[0]?.url || null
    } as any
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

    // Update product first
    await this.productsRepository.update(id, productData)

    // Xử lý images sau khi update product
    // Nếu images là array (kể cả empty), update images
    // Nếu images là undefined, giữ nguyên images hiện tại
    if (images !== undefined) {
      await this.productsRepository.updateProductImages(id, images)
    }

    return this.productsRepository.findById(id)
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

  async getProductTypes() {
    return this.productsRepository.getProductTypes()
  }

  async getBrands() {
    return this.productsRepository.getBrands()
  }

  async getTaxes() {
    return this.productsRepository.getTaxes()
  }

  // ============================================
  // PRODUCT TYPES CRUD
  // ============================================

  async createProductType(data: { name: string; code?: string; sortOrder?: number }) {
    return this.productsRepository.createProductType(data)
  }

  async updateProductType(id: number, data: { name?: string; code?: string; sortOrder?: number }) {
    const existing = await this.productsRepository.findProductTypeById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy loại sản phẩm')
    }
    return this.productsRepository.updateProductType(id, data)
  }

  async deleteProductType(id: number) {
    const existing = await this.productsRepository.findProductTypeById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy loại sản phẩm')
    }
    return this.productsRepository.deleteProductType(id)
  }

  // ============================================
  // BRANDS CRUD
  // ============================================

  async createBrand(data: { name: string; country?: string; description?: string }) {
    return this.productsRepository.createBrand(data)
  }

  async updateBrand(id: number, data: { name?: string; country?: string; description?: string }) {
    const existing = await this.productsRepository.findBrandById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhãn hiệu')
    }
    return this.productsRepository.updateBrand(id, data)
  }

  async deleteBrand(id: number) {
    const existing = await this.productsRepository.findBrandById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy nhãn hiệu')
    }
    return this.productsRepository.deleteBrand(id)
  }

  // ============================================
  // TAXES CRUD
  // ============================================

  async createTax(data: { name: string; code?: string; rate: number; description?: string }) {
    return this.productsRepository.createTax(data)
  }

  async updateTax(id: number, data: { name?: string; code?: string; rate?: number; description?: string }) {
    const existing = await this.productsRepository.findTaxById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy thuế')
    }
    return this.productsRepository.updateTax(id, data)
  }

  async deleteTax(id: number) {
    const existing = await this.productsRepository.findTaxById(id)
    if (!existing) {
      throw new NotFoundException('Không tìm thấy thuế')
    }
    return this.productsRepository.deleteTax(id)
  }
}

