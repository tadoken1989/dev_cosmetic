import { Injectable } from '@nestjs/common'

@Injectable()
export class InventoryService {
  findAll() {
    return { message: 'Inventory service - Coming soon' }
  }
}

