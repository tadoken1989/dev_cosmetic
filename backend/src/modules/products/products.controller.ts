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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFilterDto } from './dto/product-filter.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ============================================
  // STATIC ROUTES FIRST (before :id routes)
  // ============================================

  @Get('types/list')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách loại sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách loại sản phẩm' })
  async getProductTypes() {
    const types = await this.productsService.getProductTypes()
    return {
      success: true,
      data: types,
    }
  }

  @Get('brands/list')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách nhãn hiệu' })
  @ApiResponse({ status: 200, description: 'Danh sách nhãn hiệu' })
  async getBrands() {
    const brands = await this.productsService.getBrands()
    return {
      success: true,
      data: brands,
    }
  }

  @Get('taxes/list')
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách thuế' })
  @ApiResponse({ status: 200, description: 'Danh sách thuế' })
  async getTaxes() {
    const taxes = await this.productsService.getTaxes()
    return {
      success: true,
      data: taxes,
    }
  }

  // ============================================
  // PRODUCT TYPES CRUD
  // ============================================

  @Post('types')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo loại sản phẩm mới' })
  async createProductType(
    @Body() data: { name: string; code?: string; sortOrder?: number },
  ) {
    const result = await this.productsService.createProductType(data)
    return { success: true, data: result }
  }

  @Patch('types/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật loại sản phẩm' })
  async updateProductType(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; code?: string; sortOrder?: number },
  ) {
    const result = await this.productsService.updateProductType(id, data)
    return { success: true, data: result }
  }

  @Delete('types/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa loại sản phẩm' })
  async deleteProductType(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.deleteProductType(id)
    return { success: true, message: 'Đã xóa loại sản phẩm' }
  }

  // ============================================
  // BRANDS CRUD
  // ============================================

  @Post('brands')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo nhãn hiệu mới' })
  async createBrand(
    @Body() data: { name: string; country?: string; description?: string },
  ) {
    const result = await this.productsService.createBrand(data)
    return { success: true, data: result }
  }

  @Patch('brands/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật nhãn hiệu' })
  async updateBrand(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; country?: string; description?: string },
  ) {
    const result = await this.productsService.updateBrand(id, data)
    return { success: true, data: result }
  }

  @Delete('brands/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa nhãn hiệu' })
  async deleteBrand(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.deleteBrand(id)
    return { success: true, message: 'Đã xóa nhãn hiệu' }
  }

  // ============================================
  // TAXES CRUD
  // ============================================

  @Post('taxes')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo thuế mới' })
  async createTax(
    @Body() data: { name: string; code?: string; rate: number; description?: string },
  ) {
    const result = await this.productsService.createTax(data)
    return { success: true, data: result }
  }

  @Patch('taxes/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật thuế' })
  async updateTax(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { name?: string; code?: string; rate?: number; description?: string },
  ) {
    const result = await this.productsService.updateTax(id, data)
    return { success: true, data: result }
  }

  @Delete('taxes/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa thuế' })
  async deleteTax(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.deleteTax(id)
    return { success: true, message: 'Đã xóa thuế' }
  }

  @Get('search/:query')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm' })
  async search(@Param('query') query: string) {
    return this.productsService.search(query)
  }

  // ============================================
  // CRUD ROUTES
  // ============================================

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Tạo sản phẩm mới' })
  @ApiResponse({ status: 201, description: 'Tạo sản phẩm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.create(createProductDto, user.id)
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  @ApiResponse({ status: 200, description: 'Danh sách sản phẩm' })
  async findAll(@Query() filters: ProductFilterDto) {
    return this.productsService.findAll(filters)
  }

  // ============================================
  // DYNAMIC :id ROUTES LAST
  // ============================================

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Lấy thông tin sản phẩm theo ID' })
  @ApiResponse({ status: 200, description: 'Thông tin sản phẩm' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id)
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cập nhật sản phẩm' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto, user.id)
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Xóa sản phẩm' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sản phẩm' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id)
  }
}
