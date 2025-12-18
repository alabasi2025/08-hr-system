import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsDateString,
  IsEnum,
  MaxLength,
} from 'class-validator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum MaritalStatus {
  SINGLE = 'single',
  MARRIED = 'married',
  DIVORCED = 'divorced',
  WIDOWED = 'widowed',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

export enum IdType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  RESIDENCE = 'residence',
}

export class CreateEmployeeDto {
  @IsString()
  @MaxLength(20)
  employee_number: string;

  // البيانات الشخصية
  @IsString()
  @MaxLength(100)
  first_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  middle_name?: string;

  @IsString()
  @MaxLength(100)
  last_name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  full_name_ar?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  full_name_en?: string;

  // الهوية
  @IsOptional()
  @IsEnum(IdType)
  id_type?: IdType;

  @IsString()
  @MaxLength(50)
  id_number: string;

  @IsOptional()
  @IsDateString()
  id_expiry_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  place_of_birth?: string;

  @IsOptional()
  @IsEnum(MaritalStatus)
  marital_status?: MaritalStatus;

  // معلومات الاتصال
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MaxLength(20)
  mobile: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  personal_email?: string;

  // العنوان
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  // جهة الاتصال في الطوارئ
  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergency_contact_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  emergency_contact_phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  emergency_contact_relation?: string;

  // الصورة
  @IsOptional()
  @IsString()
  @MaxLength(500)
  photo_path?: string;

  // الحالة
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  // العلاقات
  @IsOptional()
  @IsUUID()
  department_id?: string;

  @IsOptional()
  @IsUUID()
  position_id?: string;

  @IsOptional()
  @IsUUID()
  manager_id?: string;
}
