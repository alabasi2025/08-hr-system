import { IsString, IsOptional, IsBoolean, IsUUID, IsInt, MaxLength, Min } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @MaxLength(20)
  code: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title_ar?: string;

  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsUUID()
  grade_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  responsibilities?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  headcount?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
