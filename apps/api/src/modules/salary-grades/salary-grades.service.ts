import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalaryGradeDto } from './dto/create-salary-grade.dto';
import { UpdateSalaryGradeDto } from './dto/update-salary-grade.dto';
import { CreateSalaryDetailsDto } from './dto/create-salary-details.dto';

@Injectable()
export class SalaryGradesService {
  constructor(private prisma: PrismaService) {}

  // سلم الرواتب
  async createGrade(dto: CreateSalaryGradeDto) {
    // التحقق من عدم وجود سلم بنفس الكود
    const existing = await this.prisma.hr_salary_grades.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`سلم الرواتب بالكود ${dto.code} موجود مسبقاً`);
    }

    // التحقق من أن الحد الأدنى أقل من الحد الأقصى
    if (dto.min_salary > dto.max_salary) {
      throw new BadRequestException('الحد الأدنى للراتب يجب أن يكون أقل من الحد الأقصى');
    }

    return this.prisma.hr_salary_grades.create({
      data: {
        ...dto,
        min_salary: dto.min_salary,
        max_salary: dto.max_salary,
        housing_allowance_pct: dto.housing_allowance_pct || 0,
        transport_allowance: dto.transport_allowance || 0,
      },
    });
  }

  async findAllGrades(includeInactive = false) {
    const where = includeInactive ? {} : { is_active: true };

    return this.prisma.hr_salary_grades.findMany({
      where,
      include: {
        _count: {
          select: { positions: true, salary_details: true },
        },
      },
      orderBy: { min_salary: 'asc' },
    });
  }

  async findOneGrade(id: string) {
    const grade = await this.prisma.hr_salary_grades.findUnique({
      where: { id },
      include: {
        positions: true,
        salary_details: {
          include: {
            employee: {
              select: {
                id: true,
                employee_number: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });

    if (!grade) {
      throw new NotFoundException(`سلم الرواتب بالمعرف ${id} غير موجود`);
    }

    return grade;
  }

  async updateGrade(id: string, dto: UpdateSalaryGradeDto) {
    await this.findOneGrade(id);

    // التحقق من عدم تكرار الكود
    if (dto.code) {
      const existing = await this.prisma.hr_salary_grades.findFirst({
        where: {
          code: dto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`سلم الرواتب بالكود ${dto.code} موجود مسبقاً`);
      }
    }

    return this.prisma.hr_salary_grades.update({
      where: { id },
      data: dto,
    });
  }

  async removeGrade(id: string) {
    await this.findOneGrade(id);

    // التحقق من عدم وجود موظفين مرتبطين
    const employeesCount = await this.prisma.hr_salary_details.count({
      where: { grade_id: id },
    });

    if (employeesCount > 0) {
      throw new ConflictException(`لا يمكن حذف سلم الرواتب لأنه مرتبط بـ ${employeesCount} موظف`);
    }

    return this.prisma.hr_salary_grades.delete({
      where: { id },
    });
  }

  // بيانات راتب الموظف
  async createSalaryDetails(dto: CreateSalaryDetailsDto) {
    // التحقق من وجود الموظف
    const employee = await this.prisma.hr_employees.findUnique({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException(`الموظف بالمعرف ${dto.employee_id} غير موجود`);
    }

    // التحقق من عدم وجود بيانات راتب مسبقة
    const existing = await this.prisma.hr_salary_details.findUnique({
      where: { employee_id: dto.employee_id },
    });

    if (existing) {
      throw new ConflictException('بيانات الراتب موجودة مسبقاً لهذا الموظف');
    }

    // التحقق من سلم الرواتب إذا تم تحديده
    if (dto.grade_id) {
      const grade = await this.prisma.hr_salary_grades.findUnique({
        where: { id: dto.grade_id },
      });

      if (!grade) {
        throw new NotFoundException(`سلم الرواتب بالمعرف ${dto.grade_id} غير موجود`);
      }

      // التحقق من أن الراتب ضمن نطاق السلم
      if (dto.basic_salary < Number(grade.min_salary) || dto.basic_salary > Number(grade.max_salary)) {
        throw new BadRequestException(
          `الراتب الأساسي يجب أن يكون بين ${grade.min_salary} و ${grade.max_salary}`,
        );
      }
    }

    return this.prisma.hr_salary_details.create({
      data: {
        employee_id: dto.employee_id,
        grade_id: dto.grade_id,
        basic_salary: dto.basic_salary,
        currency: dto.currency || 'YER',
        housing_allowance: dto.housing_allowance || 0,
        transport_allowance: dto.transport_allowance || 0,
        food_allowance: dto.food_allowance || 0,
        phone_allowance: dto.phone_allowance || 0,
        other_allowances: dto.other_allowances || 0,
        social_insurance: dto.social_insurance || 0,
        tax_deduction: dto.tax_deduction || 0,
        payment_method: dto.payment_method,
        bank_name: dto.bank_name,
        bank_account: dto.bank_account,
        iban: dto.iban,
        effective_from: new Date(dto.effective_from),
        effective_to: dto.effective_to ? new Date(dto.effective_to) : null,
      },
      include: {
        employee: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
        grade: true,
      },
    });
  }

  async findSalaryDetails(employeeId: string) {
    const details = await this.prisma.hr_salary_details.findUnique({
      where: { employee_id: employeeId },
      include: {
        employee: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
        grade: true,
      },
    });

    if (!details) {
      throw new NotFoundException(`بيانات الراتب للموظف بالمعرف ${employeeId} غير موجودة`);
    }

    // حساب إجمالي الراتب
    const grossSalary =
      Number(details.basic_salary) +
      Number(details.housing_allowance) +
      Number(details.transport_allowance) +
      Number(details.food_allowance) +
      Number(details.phone_allowance) +
      Number(details.other_allowances);

    const totalDeductions =
      Number(details.social_insurance) + Number(details.tax_deduction);

    return {
      ...details,
      gross_salary: grossSalary,
      total_deductions: totalDeductions,
      net_salary: grossSalary - totalDeductions,
    };
  }

  async updateSalaryDetails(employeeId: string, dto: Partial<CreateSalaryDetailsDto>) {
    const existing = await this.prisma.hr_salary_details.findUnique({
      where: { employee_id: employeeId },
    });

    if (!existing) {
      throw new NotFoundException('بيانات الراتب غير موجودة لهذا الموظف');
    }

    const updateData: any = {};

    if (dto.grade_id !== undefined) updateData.grade_id = dto.grade_id;
    if (dto.basic_salary !== undefined) updateData.basic_salary = dto.basic_salary;
    if (dto.currency !== undefined) updateData.currency = dto.currency;
    if (dto.housing_allowance !== undefined) updateData.housing_allowance = dto.housing_allowance;
    if (dto.transport_allowance !== undefined) updateData.transport_allowance = dto.transport_allowance;
    if (dto.food_allowance !== undefined) updateData.food_allowance = dto.food_allowance;
    if (dto.phone_allowance !== undefined) updateData.phone_allowance = dto.phone_allowance;
    if (dto.other_allowances !== undefined) updateData.other_allowances = dto.other_allowances;
    if (dto.social_insurance !== undefined) updateData.social_insurance = dto.social_insurance;
    if (dto.tax_deduction !== undefined) updateData.tax_deduction = dto.tax_deduction;
    if (dto.payment_method !== undefined) updateData.payment_method = dto.payment_method;
    if (dto.bank_name !== undefined) updateData.bank_name = dto.bank_name;
    if (dto.bank_account !== undefined) updateData.bank_account = dto.bank_account;
    if (dto.iban !== undefined) updateData.iban = dto.iban;
    if (dto.effective_from !== undefined) updateData.effective_from = new Date(dto.effective_from);
    if (dto.effective_to !== undefined) updateData.effective_to = dto.effective_to ? new Date(dto.effective_to) : null;

    return this.prisma.hr_salary_details.update({
      where: { employee_id: employeeId },
      data: updateData,
      include: {
        employee: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
        grade: true,
      },
    });
  }
}
