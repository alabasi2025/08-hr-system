import { IsNotEmpty, IsInt, IsOptional, IsDateString, IsString, Min, Max } from 'class-validator';

export class CreatePayrollDto {
  @IsInt()
  @Min(2020)
  @Max(2100)
  period_year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  period_month: number;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CalculatePayrollDto {
  @IsNotEmpty()
  @IsString()
  payroll_id: string;
}

export class ApprovePayrollDto {
  @IsNotEmpty()
  @IsString()
  payroll_id: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
