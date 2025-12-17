import { Injectable } from '@nestjs/common'

@Injectable()
export class BranchesService {
  findAll() {
    return { message: 'Branches service - Coming soon' }
  }
}

