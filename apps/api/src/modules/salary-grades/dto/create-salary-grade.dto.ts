import { IsString, IsOptional, IsBoolean, IsNumber, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSalaryGradeDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  name_ar?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  min_salary: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  max_salary: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  housing_allowance_pct?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  transport_allowance?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
