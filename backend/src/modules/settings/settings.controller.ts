import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { SettingsService } from './settings.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // ================== BRANCHES ==================
  @Get('branches')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách chi nhánh' })
  async getBranches() {
    const data = await this.settingsService.getAllBranches()
    return { success: true, data }
  }

  @Post('branches')
  @Roles('admin')
  @ApiOperation({ summary: 'Tạo chi nhánh mới' })
  async createBranch(@Body() data: { name: string; code?: string; address?: string; phone?: string; email?: string }) {
    const result = await this.settingsService.createBranch(data)
    return { success: true, data: result }
  }

  @Patch('branches/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Cập nhật chi nhánh' })
  async updateBranch(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{ name: string; code: string; address: string; phone: string; email: string; isActive: boolean }>,
  ) {
    const result = await this.settingsService.updateBranch(id, data)
    return { success: true, data: result }
  }

  @Delete('branches/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa chi nhánh' })
  async deleteBranch(@Param('id', ParseIntPipe) id: number) {
    const result = await this.settingsService.deleteBranch(id)
    return { success: true, ...result }
  }

  // ================== UNITS ==================
  @Get('units')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách đơn vị' })
  async getUnits() {
    const data = await this.settingsService.getAllUnits()
    return { success: true, data }
  }

  @Post('units')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo đơn vị mới' })
  async createUnit(@Body() data: { name: string; abbreviation?: string; description?: string }) {
    const result = await this.settingsService.createUnit(data)
    return { success: true, data: result }
  }

  @Patch('units/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật đơn vị' })
  async updateUnit(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{ name: string; abbreviation: string; description: string; isActive: boolean }>,
  ) {
    const result = await this.settingsService.updateUnit(id, data)
    return { success: true, data: result }
  }

  @Delete('units/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa đơn vị' })
  async deleteUnit(@Param('id', ParseIntPipe) id: number) {
    const result = await this.settingsService.deleteUnit(id)
    return { success: true, ...result }
  }

  // ================== ATTRIBUTES ==================
  @Get('attributes')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách thuộc tính' })
  async getAttributes() {
    const data = await this.settingsService.getAllAttributes()
    return { success: true, data }
  }

  @Post('attributes')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo thuộc tính mới' })
  async createAttribute(@Body() data: { name: string; type?: string; defaultValues?: string[]; description?: string }) {
    const result = await this.settingsService.createAttribute(data)
    return { success: true, data: result }
  }

  @Patch('attributes/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật thuộc tính' })
  async updateAttribute(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<{ name: string; type: string; defaultValues: string[]; description: string; isActive: boolean }>,
  ) {
    const result = await this.settingsService.updateAttribute(id, data)
    return { success: true, data: result }
  }

  @Delete('attributes/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa thuộc tính' })
  async deleteAttribute(@Param('id', ParseIntPipe) id: number) {
    const result = await this.settingsService.deleteAttribute(id)
    return { success: true, ...result }
  }
}





