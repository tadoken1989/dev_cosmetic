import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { ManagementType } from '../entities/product.entity'

export class ProductFilterDto {
  @ApiPropertyOptional({ description: 'Số trang', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize?: number

  @ApiPropertyOptional({ description: 'Tìm kiếm', example: 'kem' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: 'ID loại sản phẩm' })
  @IsOptional()
  @Type(() => Number)
  productTypeId?: number

  @ApiPropertyOptional({ description: 'ID nhãn hiệu' })
  @IsOptional()
  @Type(() => Number)
  brandId?: number

  @ApiPropertyOptional({ description: 'Hình thức quản lý', enum: ManagementType })
  @IsOptional()
  @IsEnum(ManagementType)
  managementType?: ManagementType

  @ApiPropertyOptional({ description: 'Cho phép bán' })
  @IsOptional()
  @Type(() => Boolean)
  allowSale?: boolean

  @ApiPropertyOptional({ description: 'Giá tối thiểu' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number

  @ApiPropertyOptional({ description: 'Giá tối đa' })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number

  @ApiPropertyOptional({ description: 'Sắp xếp theo', example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC'

  @ApiPropertyOptional({ description: 'Cache buster timestamp' })
  @IsOptional()
  @Type(() => Number)
  _t?: number
}

