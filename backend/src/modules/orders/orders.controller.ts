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
import { OrdersService } from './orders.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ================== STATIC ROUTES FIRST ==================

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId') customerId?: number,
    @Query('staffId') staffId?: number,
  ) {
    try {
      const result = await this.ordersService.findAllOrders({
        page,
        pageSize,
        search,
        status,
        paymentStatus,
        startDate,
        endDate,
        customerId,
        staffId,
      })
      return { success: true, data: result }
    } catch (error) {
      console.error('Find all orders error:', error)
      return {
        success: true,
        data: {
          data: [],
          total: 0,
          page: page || 1,
          pageSize: pageSize || 20,
          totalPages: 0,
        },
      }
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê đơn hàng' })
  async getStats() {
    const stats = await this.ordersService.getOrderStats()
    return { success: true, data: stats }
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Lấy đơn hàng theo mã' })
  async findByCode(@Param('code') code: string) {
    const order = await this.ordersService.findOrderByCode(code)
    return { success: true, data: order }
  }

  // ================== RETURNS - STATIC ROUTES ==================

  @Get('returns/list')
  @ApiOperation({ summary: 'Lấy danh sách đơn trả hàng' })
  async findAllReturns(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.ordersService.findAllReturns({
      page,
      pageSize,
      search,
      status,
      startDate,
      endDate,
    })
    return { success: true, data: result }
  }

  @Post('returns')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Tạo đơn trả hàng' })
  async createReturn(@Body() data: any, @CurrentUser() user: any) {
    const orderReturn = await this.ordersService.createReturn(data, user.id)
    return { success: true, data: orderReturn }
  }

  @Get('returns/:id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn trả hàng' })
  async findReturn(@Param('id', ParseIntPipe) id: number) {
    const orderReturn = await this.ordersService.findReturnById(id)
    return { success: true, data: orderReturn }
  }

  @Patch('returns/:id/status')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn trả hàng' })
  async updateReturnStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    const orderReturn = await this.ordersService.updateReturnStatus(id, status, user.id)
    return { success: true, data: orderReturn }
  }

  // ================== DYNAMIC ROUTES LAST ==================

  @Post()
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Tạo đơn hàng mới' })
  async create(@Body() data: any, @CurrentUser() user: any) {
    const order = await this.ordersService.createOrder(data, user.id)
    return { success: true, data: order }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết đơn hàng' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.findOrderById(id)
    return { success: true, data: order }
  }

  @Patch(':id')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Cập nhật đơn hàng' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: any,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.updateOrder(id, data, user.id)
    return { success: true, data: order }
  }

  @Patch(':id/status')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.updateOrderStatus(id, status, user.id)
    return { success: true, data: order }
  }

  @Post(':id/payment')
  @Roles('admin', 'manager', 'staff')
  @ApiOperation({ summary: 'Thêm thanh toán' })
  async addPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body('amount') amount: number,
    @CurrentUser() user: any,
  ) {
    const order = await this.ordersService.addPayment(id, amount, user.id)
    return { success: true, data: order }
  }

  @Post(':id/cancel')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Hủy đơn hàng' })
  async cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    const order = await this.ordersService.cancelOrder(id, user.id)
    return { success: true, data: order }
  }
}
