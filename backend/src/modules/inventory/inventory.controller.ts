import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { InventoryService } from './inventory.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('product/:productId')
  @ApiOperation({ summary: 'Lấy thông tin tồn kho của sản phẩm' })
  async getProductInventory(@Param('productId', ParseIntPipe) productId: number) {
    const result = await this.inventoryService.getInventorySummary(productId)
    return {
      success: true,
      data: result,
    }
  }

  @Post('product/:productId/initialize')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Khởi tạo tồn kho cho sản phẩm' })
  async initializeInventory(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: { branchId?: number; branchName?: string; quantity: number; costPrice: number },
  ) {
    const result = await this.inventoryService.initializeInventory(productId, data)
    return {
      success: true,
      data: result,
    }
  }

  @Patch('product/:productId/branch/:branchId/stock')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật số lượng tồn kho' })
  async updateStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() data: { quantity: number; type: 'add' | 'subtract' },
  ) {
    const result = await this.inventoryService.updateStock(
      productId,
      branchId,
      data.quantity,
      data.type,
    )
    return {
      success: true,
      data: result,
    }
  }

  @Patch('product/:productId/branch/:branchId/limits')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật tồn tối thiểu/tối đa' })
  async setMinMaxStock(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('branchId', ParseIntPipe) branchId: number,
    @Body() data: { minStock: number | null; maxStock: number | null },
  ) {
    const result = await this.inventoryService.setMinMaxStock(
      productId,
      branchId,
      data.minStock,
      data.maxStock,
    )
    return {
      success: true,
      data: result,
    }
  }

  @Get('product/:productId/history')
  @ApiOperation({ summary: 'Lấy lịch sử xuất nhập kho của sản phẩm' })
  async getInventoryHistory(
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const result = await this.inventoryService.getInventoryHistory(productId)
    return {
      success: true,
      data: result,
    }
  }
}
