import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ManagementType } from '../entities/product.entity'

class ProductImageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string
}

export class CreateProductDto {
  @ApiProperty({ description: 'Tên sản phẩm', example: 'Kem dưỡng da' })
  @IsString()
  @IsNotEmpty({ message: 'Tên sản phẩm là bắt buộc' })
  @MinLength(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
  @MaxLength(255, { message: 'Tên sản phẩm không được quá 255 ký tự' })
  name: string

  @ApiPropertyOptional({ description: 'Mã SKU', example: 'SKU001' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string

  @ApiPropertyOptional({ description: 'Mã vạch', example: '1234567890123' })
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Mã vạch phải có ít nhất 3 ký tự' })
  @MaxLength(15, { message: 'Mã vạch không được quá 15 ký tự' })
  barcode?: string

  @ApiPropertyOptional({ description: 'Khối lượng', example: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number

  @ApiPropertyOptional({ description: 'Đơn vị khối lượng', example: 'g' })
  @IsString()
  @IsOptional()
  weightUnit?: string

  @ApiPropertyOptional({ description: 'Đơn vị tính', example: 'Hộp' })
  @IsString()
  @IsOptional()
  unit?: string

  @ApiPropertyOptional({ description: 'Mô tả sản phẩm' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Hình thức quản lý',
    enum: ManagementType,
    example: ManagementType.NORMAL,
  })
  @IsEnum(ManagementType, { message: 'Hình thức quản lý không hợp lệ' })
  @IsNotEmpty()
  managementType: ManagementType

  @ApiProperty({ description: 'Giá bán lẻ', example: 100000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0, { message: 'Giá bán lẻ phải lớn hơn hoặc bằng 0' })
  retailPrice: number

  @ApiPropertyOptional({ description: 'Giá bán buôn', example: 80000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  wholesalePrice?: number

  @ApiPropertyOptional({ description: 'Giá nhập', example: 50000 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  importPrice?: number

  @ApiPropertyOptional({ description: 'Cho phép bán', default: true })
  @IsBoolean()
  @IsOptional()
  allowSale?: boolean

  @ApiPropertyOptional({ description: 'Áp dụng thuế', default: false })
  @IsBoolean()
  @IsOptional()
  applyTax?: boolean

  @ApiPropertyOptional({ description: 'ID loại sản phẩm' })
  @IsNumber()
  @IsOptional()
  productTypeId?: number

  @ApiPropertyOptional({ description: 'ID nhãn hiệu' })
  @IsNumber()
  @IsOptional()
  brandId?: number

  @ApiPropertyOptional({ description: 'Tags', type: [String] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: 'Hình ảnh', type: [ProductImageDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[]
}

