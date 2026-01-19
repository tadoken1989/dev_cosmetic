import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { Customer } from './entities/customer.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(data: Partial<Customer>): Promise<Customer> {
    // Generate customer code
    const customerCode = await this.generateCustomerCode()
    
    const customer = this.customerRepository.create({
      ...data,
      customerCode,
    })
    
    return this.customerRepository.save(customer)
  }

  async findAll(filters: {
    page?: number
    pageSize?: number
    search?: string
    type?: string
  }) {
    const { page = 1, pageSize = 20, search, type } = filters

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('(customer.isActive = true OR customer.isActive IS NULL)')
      .orderBy('customer.createdAt', 'DESC')

    if (search) {
      queryBuilder.andWhere(
        '(customer.name ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search OR customer.customerCode ILIKE :search)',
        { search: `%${search}%` },
      )
    }

    if (type) {
      queryBuilder.andWhere('customer.type = :type', { type })
    }

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

  async findById(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } })
    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng #${id}`)
    }
    return customer
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { phone } })
  }

  async search(query: string): Promise<Customer[]> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .where('(customer.isActive = true OR customer.isActive IS NULL)')
      .andWhere(
        '(customer.name ILIKE :query OR customer.phone ILIKE :query OR customer.customerCode ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('customer.name', 'ASC')
      .take(10)
      .getMany()
  }

  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const customer = await this.findById(id)
    Object.assign(customer, data)
    return this.customerRepository.save(customer)
  }

  async delete(id: number): Promise<void> {
    const customer = await this.findById(id)
    customer.isActive = false
    await this.customerRepository.save(customer)
  }

  async updateOrderStats(customerId: number, orderTotal: number): Promise<void> {
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({
        totalOrders: () => 'totalOrders + 1',
        totalSpent: () => `totalSpent + ${orderTotal}`,
        lastOrderAt: new Date(),
      })
      .where('id = :id', { id: customerId })
      .execute()
  }

  private async generateCustomerCode(): Promise<string> {
    const prefix = 'KH'
    
    const lastCustomer = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.customerCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('customer.id', 'DESC')
      .getOne()

    let sequence = 1
    if (lastCustomer && lastCustomer.customerCode) {
      const lastNum = parseInt(lastCustomer.customerCode.replace(prefix, ''), 10)
      if (!isNaN(lastNum)) {
        sequence = lastNum + 1
      }
    }

    return `${prefix}${sequence.toString().padStart(5, '0')}`
  }

  // Sync all customer stats from orders (call manually when needed)
  async syncAllCustomerStats(): Promise<{ synced: number }> {
    // Get all customers with orders using raw query
    const result = await this.customerRepository.manager.query(`
      UPDATE customers c
      SET 
        "totalOrders" = COALESCE(stats.order_count, 0),
        "totalSpent" = COALESCE(stats.total_spent, 0),
        "lastOrderAt" = stats.last_order
      FROM (
        SELECT 
          "customerId",
          COUNT(*) as order_count,
          SUM(total) as total_spent,
          MAX("createdAt") as last_order
        FROM orders 
        WHERE "customerId" IS NOT NULL
        AND status != 'cancelled'
        GROUP BY "customerId"
      ) stats
      WHERE c.id = stats."customerId"
    `)
    
    return { synced: result[1] || 0 }
  }
}
