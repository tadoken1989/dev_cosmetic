import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateProductTypeDto {
  @ApiProperty({ description: 'Tên loại sản phẩm', example: 'Mỹ phẩm' })
  @IsString()
  @IsNotEmpty({ message: 'Tên loại sản phẩm là bắt buộc' })
  @MaxLength(100, { message: 'Tên loại sản phẩm không được quá 100 ký tự' })
  name: string

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ description: 'ID loại cha (nếu có)' })
  @IsNumber()
  @IsOptional()
  parentId?: number

  @ApiPropertyOptional({ description: 'Thứ tự sắp xếp', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number
}





