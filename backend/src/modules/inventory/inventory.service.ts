import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Inventory } from './entities/inventory.entity'

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async findByProduct(productId: number): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { productId },
      order: { branchId: 'ASC' },
    })
  }

  async findByProductAndBranch(productId: number, branchId: number): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({
      where: { productId, branchId },
    })
  }

  async initializeInventory(
    productId: number,
    data: {
      branchId?: number
      branchName?: string
      quantity: number
      costPrice: number
    },
  ): Promise<Inventory> {
    const branchId = data.branchId || 1
    const branchName = data.branchName || 'Chi nhánh mặc định'

    let inventory = await this.findByProductAndBranch(productId, branchId)

    if (inventory) {
      // Update existing
      inventory.quantity = data.quantity
      inventory.available = data.quantity
      inventory.costPrice = data.costPrice
    } else {
      // Create new
      inventory = this.inventoryRepository.create({
        productId,
        branchId,
        branchName,
        quantity: data.quantity,
        available: data.quantity,
        costPrice: data.costPrice,
      })
    }

    return this.inventoryRepository.save(inventory)
  }

  async updateStock(
    productId: number,
    branchId: number,
    quantityChange: number,
    type: 'add' | 'subtract',
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndBranch(productId, branchId)
    
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy thông tin kho')
    }

    if (type === 'add') {
      inventory.quantity += quantityChange
      inventory.available += quantityChange
    } else {
      inventory.quantity -= quantityChange
      inventory.available -= quantityChange
    }

    return this.inventoryRepository.save(inventory)
  }

  async reserveStock(productId: number, branchId: number, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProductAndBranch(productId, branchId)
    
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy thông tin kho')
    }

    if (inventory.available < quantity) {
      throw new BadRequestException('Không đủ hàng để bán')
    }

    inventory.available -= quantity
    inventory.inTransaction += quantity

    return this.inventoryRepository.save(inventory)
  }

  async releaseStock(productId: number, branchId: number, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProductAndBranch(productId, branchId)
    
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy thông tin kho')
    }

    inventory.available += quantity
    inventory.inTransaction -= quantity

    return this.inventoryRepository.save(inventory)
  }

  async commitStock(productId: number, branchId: number, quantity: number): Promise<Inventory> {
    const inventory = await this.findByProductAndBranch(productId, branchId)
    
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy thông tin kho')
    }

    inventory.quantity -= quantity
    inventory.inTransaction -= quantity

    return this.inventoryRepository.save(inventory)
  }

  async setMinMaxStock(
    productId: number,
    branchId: number,
    minStock: number | null,
    maxStock: number | null,
  ): Promise<Inventory> {
    const inventory = await this.findByProductAndBranch(productId, branchId)
    
    if (!inventory) {
      throw new NotFoundException('Không tìm thấy thông tin kho')
    }

    inventory.minStock = minStock
    inventory.maxStock = maxStock

    return this.inventoryRepository.save(inventory)
  }

  async getInventorySummary(productId: number) {
    const inventories = await this.findByProduct(productId)
    
    // Return empty summary if no inventory exists (not an error)
    if (!inventories || inventories.length === 0) {
      return {
        totalQuantity: 0,
        totalAvailable: 0,
        inTransaction: 0,
        incoming: 0,
        outgoing: 0,
        branches: [],
      }
    }
    
    return {
      totalQuantity: inventories.reduce((sum, inv) => sum + (inv.quantity || 0), 0),
      totalAvailable: inventories.reduce((sum, inv) => sum + (inv.available || 0), 0),
      inTransaction: inventories.reduce((sum, inv) => sum + (inv.inTransaction || 0), 0),
      incoming: 0, // Will be calculated from pending import orders
      outgoing: 0, // Will be calculated from pending export orders
      branches: inventories,
    }
  }

  async getInventoryHistory(productId: number) {
    // Mock data for now - will be connected to inventory_transactions table
    return [
      {
        id: 1,
        productId,
        date: new Date().toISOString(),
        staff: 'Lê Nguyễn Thùy Linh',
        action: 'Xuất kho giao hàng cho khách/shipper',
        quantityChange: -1,
        stock: 1,
        documentCode: 'SON02184',
        branch: 'Chi nhánh mặc định',
      },
      {
        id: 2,
        productId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        staff: 'Lê Nguyễn Thùy Linh',
        action: 'Nhập hàng vào kho',
        quantityChange: +2,
        stock: 2,
        documentCode: 'PON00408',
        branch: 'Chi nhánh mặc định',
      },
      {
        id: 3,
        productId,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        staff: '',
        action: 'Khởi tạo variant',
        quantityChange: 0,
        stock: 0,
        documentCode: null,
        branch: 'Chi nhánh mặc định',
      },
    ]
  }
}
