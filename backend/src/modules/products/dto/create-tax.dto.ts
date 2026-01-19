import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength, Min, Max } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTaxDto {
  @ApiProperty({ description: 'Tên thuế', example: 'VAT' })
  @IsString()
  @IsNotEmpty({ message: 'Tên thuế là bắt buộc' })
  @MaxLength(100, { message: 'Tên thuế không được quá 100 ký tự' })
  name: string

  @ApiPropertyOptional({ description: 'Mã thuế', example: 'VAT10' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  code?: string

  @ApiProperty({ description: 'Tỷ lệ thuế (%)', example: 10 })
  @IsNumber()
  @IsNotEmpty({ message: 'Tỷ lệ thuế là bắt buộc' })
  @Min(0, { message: 'Tỷ lệ thuế phải >= 0' })
  @Max(100, { message: 'Tỷ lệ thuế phải <= 100' })
  rate: number

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string
}





