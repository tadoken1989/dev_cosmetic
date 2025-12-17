import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { BranchesService } from './branches.service'

@ApiTags('Branches')
@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll() {
    return this.branchesService.findAll()
  }
}

