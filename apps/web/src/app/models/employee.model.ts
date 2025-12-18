export interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name_ar?: string;
  full_name_en?: string;
  id_type?: string;
  id_number: string;
  id_expiry_date?: string;
  nationality?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  place_of_birth?: string;
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed';
  phone?: string;
  mobile: string;
  email?: string;
  personal_email?: string;
  address?: string;
  city?: string;
  district?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  photo_path?: string;
  status: 'active' | 'inactive' | 'terminated' | 'suspended';
  department_id?: string;
  position_id?: string;
  manager_id?: string;
  department?: Department;
  position?: Position;
  manager?: Employee;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeDto {
  employee_number: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name_ar?: string;
  full_name_en?: string;
  id_type?: string;
  id_number: string;
  id_expiry_date?: string;
  nationality?: string;
  gender?: 'male' | 'female';
  date_of_birth?: string;
  place_of_birth?: string;
  marital_status?: string;
  phone?: string;
  mobile: string;
  email?: string;
  personal_email?: string;
  address?: string;
  city?: string;
  district?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  photo_path?: string;
  status?: string;
  department_id?: string;
  position_id?: string;
  manager_id?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  parent_id?: string;
  manager_id?: string;
  is_active: boolean;
  parent?: Department;
  children?: Department[];
  _count?: { employees: number };
  created_at: string;
  updated_at: string;
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  name_ar?: string;
  parent_id?: string;
  manager_id?: string;
  is_active?: boolean;
}

export interface Position {
  id: string;
  code: string;
  title: string;
  title_ar?: string;
  department_id?: string;
  grade_id?: string;
  level?: number;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  headcount: number;
  current_count: number;
  is_active: boolean;
  department?: Department;
  grade?: SalaryGrade;
  created_at: string;
  updated_at: string;
}

export interface CreatePositionDto {
  code: string;
  title: string;
  title_ar?: string;
  department_id?: string;
  grade_id?: string;
  level?: number;
  description?: string;
  responsibilities?: string;
  requirements?: string;
  headcount?: number;
  is_active?: boolean;
}

export interface SalaryGrade {
  id: string;
  code: string;
  name: string;
  name_ar?: string;
  min_salary: number;
  max_salary: number;
  housing_allowance_pct: number;
  transport_allowance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryGradeDto {
  code: string;
  name: string;
  name_ar?: string;
  min_salary: number;
  max_salary: number;
  housing_allowance_pct?: number;
  transport_allowance?: number;
  is_active?: boolean;
}

export interface SalaryDetails {
  id: string;
  employee_id: string;
  grade_id?: string;
  basic_salary: number;
  currency: string;
  housing_allowance: number;
  transport_allowance: number;
  food_allowance: number;
  phone_allowance: number;
  other_allowances: number;
  social_insurance: number;
  tax_deduction: number;
  payment_method?: string;
  bank_name?: string;
  bank_account?: string;
  iban?: string;
  effective_from: string;
  effective_to?: string;
  employee?: Employee;
  grade?: SalaryGrade;
  gross_salary?: number;
  total_deductions?: number;
  net_salary?: number;
}

export interface CreateSalaryDetailsDto {
  grade_id?: string;
  basic_salary: number;
  currency?: string;
  housing_allowance?: number;
  transport_allowance?: number;
  food_allowance?: number;
  phone_allowance?: number;
  other_allowances?: number;
  social_insurance?: number;
  tax_deduction?: number;
  payment_method?: string;
  bank_name?: string;
  bank_account?: string;
  iban?: string;
  effective_from: string;
  effective_to?: string;
}

export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  byDepartment: { department: Department; count: number }[];
  byStatus: { status: string; count: number }[];
  recentHires: Employee[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
