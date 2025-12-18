import { IsString, IsOptional, IsBoolean, IsUUID, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
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

  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @IsOptional()
  @IsUUID()
  manager_id?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
