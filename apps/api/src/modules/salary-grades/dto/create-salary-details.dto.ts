import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, IsEnum, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  CHECK = 'check',
}

export class CreateSalaryDetailsDto {
  @IsUUID()
  employee_id: string;

  @IsOptional()
  @IsUUID()
  grade_id?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basic_salary: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  housing_allowance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  transport_allowance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  food_allowance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  phone_allowance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  other_allowances?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  social_insurance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tax_deduction?: number;

  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bank_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bank_account?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  iban?: string;

  @IsDateString()
  effective_from: string;

  @IsOptional()
  @IsDateString()
  effective_to?: string;
}
