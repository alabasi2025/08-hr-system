-- CreateTable
CREATE TABLE "hr_departments" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100),
    "parent_id" UUID,
    "manager_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_positions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "title_ar" VARCHAR(100),
    "department_id" UUID,
    "grade_id" UUID,
    "level" INTEGER,
    "description" TEXT,
    "responsibilities" TEXT,
    "requirements" TEXT,
    "headcount" INTEGER NOT NULL DEFAULT 1,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_salary_grades" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100),
    "min_salary" DECIMAL(15,2) NOT NULL,
    "max_salary" DECIMAL(15,2) NOT NULL,
    "housing_allowance_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "transport_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_salary_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employees" (
    "id" UUID NOT NULL,
    "employee_number" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "full_name_ar" VARCHAR(200),
    "full_name_en" VARCHAR(200),
    "id_type" VARCHAR(50),
    "id_number" VARCHAR(50) NOT NULL,
    "id_expiry_date" TIMESTAMP(3),
    "nationality" VARCHAR(50),
    "gender" VARCHAR(10),
    "date_of_birth" TIMESTAMP(3),
    "place_of_birth" VARCHAR(100),
    "marital_status" VARCHAR(20),
    "phone" VARCHAR(20),
    "mobile" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100),
    "personal_email" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "emergency_contact_name" VARCHAR(100),
    "emergency_contact_phone" VARCHAR(20),
    "emergency_contact_relation" VARCHAR(50),
    "photo_path" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "department_id" UUID,
    "position_id" UUID,
    "manager_id" UUID,

    CONSTRAINT "hr_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employment_details" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "probation_end_date" TIMESTAMP(3),
    "contract_type" VARCHAR(50),
    "contract_start_date" TIMESTAMP(3),
    "contract_end_date" TIMESTAMP(3),
    "job_title" VARCHAR(100) NOT NULL,
    "job_title_ar" VARCHAR(100),
    "is_manager" BOOLEAN NOT NULL DEFAULT false,
    "work_location" VARCHAR(100),
    "station_id" UUID,
    "work_schedule" VARCHAR(50),
    "working_hours_per_week" DECIMAL(5,2) DEFAULT 40,
    "employment_status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "termination_date" TIMESTAMP(3),
    "termination_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employment_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_salary_details" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "grade_id" UUID,
    "basic_salary" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'YER',
    "housing_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "transport_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "food_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "phone_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_allowances" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "social_insurance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "payment_method" VARCHAR(50),
    "bank_name" VARCHAR(100),
    "bank_account" VARCHAR(50),
    "iban" VARCHAR(50),
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_salary_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100),
    "annual_balance" INTEGER,
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "requires_approval" BOOLEAN NOT NULL DEFAULT true,
    "requires_attachment" BOOLEAN NOT NULL DEFAULT false,
    "can_carry_forward" BOOLEAN NOT NULL DEFAULT false,
    "max_carry_forward" INTEGER NOT NULL DEFAULT 0,
    "min_days" INTEGER NOT NULL DEFAULT 1,
    "max_days" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_leave_balances" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "opening_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "accrued" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "used" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pending" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "remaining" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_leave_requests" (
    "id" UUID NOT NULL,
    "request_number" VARCHAR(50) NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days_count" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "attachment_path" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_attendance_records" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "working_hours" DECIMAL(5,2),
    "overtime_hours" DECIMAL(5,2) DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'present',
    "late_minutes" INTEGER NOT NULL DEFAULT 0,
    "early_leave_minutes" INTEGER NOT NULL DEFAULT 0,
    "source" VARCHAR(50),
    "device_id" VARCHAR(50),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_employee_loans" (
    "id" UUID NOT NULL,
    "loan_number" VARCHAR(50) NOT NULL,
    "employee_id" UUID NOT NULL,
    "loan_type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "installment_amount" DECIMAL(15,2) NOT NULL,
    "number_of_installments" INTEGER NOT NULL,
    "paid_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remaining_amount" DECIMAL(15,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_employee_loans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_payroll_runs" (
    "id" UUID NOT NULL,
    "payroll_number" VARCHAR(50) NOT NULL,
    "period_year" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "payment_date" TIMESTAMP(3),
    "total_employees" INTEGER NOT NULL DEFAULT 0,
    "total_gross" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_net" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "calculated_at" TIMESTAMP(3),
    "calculated_by" UUID,
    "approved_at" TIMESTAMP(3),
    "approved_by" UUID,
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_payroll_details" (
    "id" UUID NOT NULL,
    "payroll_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "working_days" INTEGER NOT NULL DEFAULT 30,
    "actual_days" INTEGER NOT NULL DEFAULT 30,
    "absent_days" INTEGER NOT NULL DEFAULT 0,
    "basic_salary" DECIMAL(15,2) NOT NULL,
    "housing_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "transport_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "food_allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_allowances" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "overtime_hours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtime_amount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "bonus" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "commission" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(15,2) NOT NULL,
    "absence_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "late_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "loan_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "advance_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "social_insurance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "tax_deduction" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(15,2) NOT NULL,
    "net_salary" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_payroll_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hr_departments_code_key" ON "hr_departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_positions_code_key" ON "hr_positions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_salary_grades_code_key" ON "hr_salary_grades"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_employee_number_key" ON "hr_employees"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employees_email_key" ON "hr_employees"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employment_details_employee_id_key" ON "hr_employment_details"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_salary_details_employee_id_key" ON "hr_salary_details"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_types_code_key" ON "hr_leave_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employee_leave_balances_employee_id_leave_type_id_year_key" ON "hr_employee_leave_balances"("employee_id", "leave_type_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "hr_leave_requests_request_number_key" ON "hr_leave_requests"("request_number");

-- CreateIndex
CREATE UNIQUE INDEX "hr_attendance_records_employee_id_date_key" ON "hr_attendance_records"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "hr_employee_loans_loan_number_key" ON "hr_employee_loans"("loan_number");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_runs_payroll_number_key" ON "hr_payroll_runs"("payroll_number");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_runs_period_year_period_month_key" ON "hr_payroll_runs"("period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "hr_payroll_details_payroll_id_employee_id_key" ON "hr_payroll_details"("payroll_id", "employee_id");

-- AddForeignKey
ALTER TABLE "hr_departments" ADD CONSTRAINT "hr_departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_positions" ADD CONSTRAINT "hr_positions_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "hr_salary_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hr_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "hr_positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employees" ADD CONSTRAINT "hr_employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "hr_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employment_details" ADD CONSTRAINT "hr_employment_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_salary_details" ADD CONSTRAINT "hr_salary_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_salary_details" ADD CONSTRAINT "hr_salary_details_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "hr_salary_grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_leave_balances" ADD CONSTRAINT "hr_employee_leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_leave_balances" ADD CONSTRAINT "hr_employee_leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "hr_leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_leave_requests" ADD CONSTRAINT "hr_leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "hr_leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_attendance_records" ADD CONSTRAINT "hr_attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_employee_loans" ADD CONSTRAINT "hr_employee_loans_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_details" ADD CONSTRAINT "hr_payroll_details_payroll_id_fkey" FOREIGN KEY ("payroll_id") REFERENCES "hr_payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_payroll_details" ADD CONSTRAINT "hr_payroll_details_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr_employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
