import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, FindOptionsWhere } from 'typeorm'
import { Product } from './entities/product.entity'
import { ProductFilterDto } from './dto/product-filter.dto'

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
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

    const [data, total] = await queryBuilder.getManyAndCount()

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
      where.id = { $ne: excludeId } as any
    }
    const count = await this.repository.count({ where })
    return count > 0
  }

  async existsByBarcode(barcode: string, excludeId?: number) {
    const where: FindOptionsWhere<Product> = { barcode }
    if (excludeId) {
      where.id = { $ne: excludeId } as any
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
}

