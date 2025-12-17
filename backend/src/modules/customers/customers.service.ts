import { Injectable } from '@nestjs/common'

@Injectable()
export class CustomersService {
  findAll() {
    return { message: 'Customers service - Coming soon' }
  }
}

