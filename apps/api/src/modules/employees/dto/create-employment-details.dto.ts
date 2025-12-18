import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  IsNumber,
  IsEnum,
  MaxLength,
  Min,
} from 'class-validator';

export enum ContractType {
  PERMANENT = 'permanent',
  CONTRACT = 'contract',
  TEMPORARY = 'temporary',
  PART_TIME = 'part_time',
}

export enum WorkSchedule {
  FULL_TIME = 'full_time',
  SHIFT = 'shift',
  FLEXIBLE = 'flexible',
}

export enum EmploymentStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export class CreateEmploymentDetailsDto {
  @IsUUID()
  employee_id: string;

  @IsDateString()
  hire_date: string;

  @IsOptional()
  @IsDateString()
  probation_end_date?: string;

  @IsOptional()
  @IsEnum(ContractType)
  contract_type?: ContractType;

  @IsOptional()
  @IsDateString()
  contract_start_date?: string;

  @IsOptional()
  @IsDateString()
  contract_end_date?: string;

  @IsString()
  @MaxLength(100)
  job_title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title_ar?: string;

  @IsOptional()
  @IsBoolean()
  is_manager?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  work_location?: string;

  @IsOptional()
  @IsUUID()
  station_id?: string;

  @IsOptional()
  @IsEnum(WorkSchedule)
  work_schedule?: WorkSchedule;

  @IsOptional()
  @IsNumber()
  @Min(0)
  working_hours_per_week?: number;

  @IsOptional()
  @IsEnum(EmploymentStatus)
  employment_status?: EmploymentStatus;
}
