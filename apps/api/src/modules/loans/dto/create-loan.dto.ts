import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, Min, IsEnum } from 'class-validator';

export enum LoanType {
  ADVANCE = 'advance',
  LOAN = 'loan',
}

export class CreateLoanDto {
  @IsNotEmpty()
  @IsString()
  employee_id: string;

  @IsEnum(LoanType)
  loan_type: LoanType;

  @IsNumber()
  @Min(0)
  total_amount: number;

  @IsNumber()
  @Min(1)
  installments: number;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateLoanDto {
  @IsOptional()
  @IsEnum(['pending', 'approved', 'active', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ApproveLoanDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
