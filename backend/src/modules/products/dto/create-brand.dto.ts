import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBrandDto {
  @ApiProperty({ description: 'Tên nhãn hiệu', example: 'L\'Oreal' })
  @IsString()
  @IsNotEmpty({ message: 'Tên nhãn hiệu là bắt buộc' })
  @MaxLength(100, { message: 'Tên nhãn hiệu không được quá 100 ký tự' })
  name: string

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ description: 'URL logo' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  logoUrl?: string
}





