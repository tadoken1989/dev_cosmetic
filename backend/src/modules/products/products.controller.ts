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

  @Get(':id')
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

  @Get('search/:query')
  @Public()
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm' })
  async search(@Param('query') query: string) {
    return this.productsService.search(query)
  }
}

