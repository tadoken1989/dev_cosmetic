import { Injectable } from '@nestjs/common'

@Injectable()
export class ReportsService {
  findAll() {
    return { message: 'Reports service - Coming soon' }
  }
}

