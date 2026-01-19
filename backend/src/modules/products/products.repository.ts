import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere, Not } from 'typeorm'
import { Product } from './entities/product.entity'
import { ProductType } from './entities/product-type.entity'
import { ProductImage } from './entities/product-image.entity'
import { Brand } from './entities/brand.entity'
import { Tax } from './entities/tax.entity'
import { ProductFilterDto } from './dto/product-filter.dto'
import { Inventory } from '../inventory/entities/inventory.entity'

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(filters: ProductFilterDto) {
    const {
      page = 1,
      pageSize = 20,
      search,
      productTypeId,
      brandId,
      managementType,
      allowSale,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters

    const queryBuilder = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productType', 'productType')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.images', 'images')
      // Join inventory để lấy stockQuantity và availableQuantity trong 1 query
      .leftJoin('inventory', 'inv', 'inv.productId = product.id AND inv.branchId = 1')
      .addSelect('COALESCE(inv.quantity, 0)', 'stockQuantity')
      .addSelect('COALESCE(inv.available, 0)', 'availableQuantity')
      .addSelect('COALESCE(inv.costPrice, 0)', 'costPrice')

    if (search) {
      queryBuilder.where(
        '(product.name ILIKE :search OR product.sku ILIKE :search OR product.barcode ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (productTypeId) {
      queryBuilder.andWhere('product.productTypeId = :productTypeId', {
        productTypeId,
      })
    }

    if (brandId) {
      queryBuilder.andWhere('product.brandId = :brandId', { brandId })
    }

    if (managementType) {
      queryBuilder.andWhere('product.managementType = :managementType', {
        managementType,
      })
    }

    if (allowSale !== undefined) {
      queryBuilder.andWhere('product.allowSale = :allowSale', { allowSale })
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.retailPrice >= :minPrice', { minPrice })
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.retailPrice <= :maxPrice', { maxPrice })
    }

    queryBuilder.orderBy(`product.${sortBy}`, sortOrder)

    const skip = (page - 1) * pageSize
    queryBuilder.skip(skip).take(pageSize)

    // Sử dụng getRawAndEntities để lấy cả entity và raw data (inventory)
    const { entities, raw } = await queryBuilder.getRawAndEntities()
    const total = await queryBuilder.getCount()

    // Map inventory data vào product
    const data = entities.map((product, index) => ({
      ...product,
      stockQuantity: parseInt(raw[index]?.stockQuantity) || 0,
      availableQuantity: parseInt(raw[index]?.availableQuantity) || 0,
      costPrice: parseFloat(raw[index]?.costPrice) || 0,
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  }

  async findById(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['productType', 'brand', 'images'],
    })
  }

  async create(productData: Partial<Product>) {
    const product = this.repository.create(productData)
    return this.repository.save(product)
  }

  async update(id: number, productData: Partial<Product>) {
    await this.repository.update(id, productData)
    return this.findById(id)
  }

  async delete(id: number) {
    return this.repository.softDelete(id)
  }

  async existsBySku(sku: string, excludeId?: number) {
    const where: FindOptionsWhere<Product> = { sku }
    if (excludeId) {
      where.id = Not(excludeId)
    }
    const count = await this.repository.count({ where })
    return count > 0
  }

  async existsByBarcode(barcode: string, excludeId?: number) {
    const where: FindOptionsWhere<Product> = { barcode }
    if (excludeId) {
      where.id = Not(excludeId)
    }
    const count = await this.repository.count({ where })
    return count > 0
  }

  async search(query: string) {
    return this.repository
      .createQueryBuilder('product')
      .where('product.name ILIKE :query', { query: `%${query}%` })
      .orWhere('product.sku ILIKE :query', { query: `%${query}%` })
      .orWhere('product.barcode ILIKE :query', { query: `%${query}%` })
      .take(20)
      .getMany()
  }

  async getProductTypes() {
    return this.productTypeRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    })
  }

  async getBrands() {
    return this.brandRepository.find({
      order: { name: 'ASC' },
    })
  }

  async getTaxes() {
    return this.taxRepository.find({
      order: { name: 'ASC' },
    })
  }

  async createProductImages(productId: number, images: Array<{ url: string; sortOrder?: number }>) {
    if (!images || images.length === 0) {
      return []
    }

    const productImages = images.map((img, index) => {
      return this.productImageRepository.create({
        productId,
        url: img.url,
        sortOrder: img.sortOrder ?? index,
        isPrimary: index === 0, // First image is primary
        altText: null,
      })
    })

    return this.productImageRepository.save(productImages)
  }

  async deleteProductImages(productId: number) {
    return this.productImageRepository.delete({ productId })
  }

  async updateProductImages(productId: number, images: Array<{ url: string; sortOrder?: number }>) {
    // Delete existing images
    await this.deleteProductImages(productId)
    
    // Create new images
    if (images && images.length > 0) {
      return this.createProductImages(productId, images)
    }
    
    return []
  }

  // ============================================
  // PRODUCT TYPES CRUD
  // ============================================

  async findProductTypeById(id: number) {
    return this.productTypeRepository.findOne({ where: { id } })
  }

  async createProductType(data: { name: string; code?: string; sortOrder?: number }) {
    const productType = this.productTypeRepository.create(data)
    return this.productTypeRepository.save(productType)
  }

  async updateProductType(id: number, data: Partial<{ name: string; code: string; sortOrder: number }>) {
    await this.productTypeRepository.update(id, data)
    return this.findProductTypeById(id)
  }

  async deleteProductType(id: number) {
    return this.productTypeRepository.delete(id)
  }

  // ============================================
  // BRANDS CRUD
  // ============================================

  async findBrandById(id: number) {
    return this.brandRepository.findOne({ where: { id } })
  }

  async createBrand(data: { name: string; country?: string; description?: string }) {
    const brand = this.brandRepository.create(data)
    return this.brandRepository.save(brand)
  }

  async updateBrand(id: number, data: Partial<{ name: string; country: string; description: string }>) {
    await this.brandRepository.update(id, data)
    return this.findBrandById(id)
  }

  async deleteBrand(id: number) {
    return this.brandRepository.delete(id)
  }

  // ============================================
  // TAXES CRUD
  // ============================================

  async findTaxById(id: number) {
    return this.taxRepository.findOne({ where: { id } })
  }

  async createTax(data: { name: string; code?: string; rate: number; description?: string }) {
    const tax = this.taxRepository.create(data)
    return this.taxRepository.save(tax)
  }

  async updateTax(id: number, data: Partial<{ name: string; code: string; rate: number; description: string }>) {
    await this.taxRepository.update(id, data)
    return this.findTaxById(id)
  }

  async deleteTax(id: number) {
    return this.taxRepository.delete(id)
  }
}

