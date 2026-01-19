import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CustomersService } from './customers.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Tạo khách hàng mới' })
  async create(@Body() data: any) {
    try {
      const customer = await this.customersService.create(data)
      return { success: true, data: customer }
    } catch (error) {
      console.error('Create customer error:', error)
      return { success: false, message: 'Không thể tạo khách hàng', data: null }
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khách hàng' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    try {
      const result = await this.customersService.findAll({
        page,
        pageSize,
        search,
        type,
      })
      return { success: true, data: result }
    } catch (error) {
      console.error('Find all customers error:', error)
      // Return empty result instead of 500 error
      return { 
        success: true, 
        data: {
          data: [],
          total: 0,
          page: page || 1,
          pageSize: pageSize || 20,
          totalPages: 0,
        }
      }
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Tìm kiếm khách hàng' })
  async search(@Query('q') query: string) {
    try {
      const customers = await this.customersService.search(query || '')
      return { success: true, data: customers }
    } catch (error) {
      console.error('Search customers error:', error)
      return { success: true, data: [] }
    }
  }

  @Post('sync-stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Sync customer stats from orders' })
  async syncStats() {
    try {
      const result = await this.customersService.syncAllCustomerStats()
      return { success: true, data: result }
    } catch (error) {
      console.error('Sync customer stats error:', error)
      return { success: false, message: 'Không thể đồng bộ thống kê khách hàng' }
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin khách hàng' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const customer = await this.customersService.findById(id)
      return { success: true, data: customer }
    } catch (error) {
      console.error('Find customer error:', error)
      return { success: false, message: 'Không tìm thấy khách hàng', data: null }
    }
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Cập nhật khách hàng' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    try {
      const customer = await this.customersService.update(id, data)
      return { success: true, data: customer }
    } catch (error) {
      console.error('Update customer error:', error)
      return { success: false, message: 'Không thể cập nhật khách hàng', data: null }
    }
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Xóa khách hàng' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.customersService.delete(id)
      return { success: true, message: 'Xóa khách hàng thành công' }
    } catch (error) {
      console.error('Delete customer error:', error)
      return { success: false, message: 'Không thể xóa khách hàng' }
    }
  }
}
