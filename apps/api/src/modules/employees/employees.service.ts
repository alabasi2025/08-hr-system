import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { CreateEmploymentDetailsDto } from './dto/create-employment-details.dto';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // التحقق من عدم وجود موظف بنفس الرقم الوظيفي
    const existingByNumber = await this.prisma.hr_employees.findUnique({
      where: { employee_number: createEmployeeDto.employee_number },
    });

    if (existingByNumber) {
      throw new ConflictException(`الموظف بالرقم الوظيفي ${createEmployeeDto.employee_number} موجود مسبقاً`);
    }

    // التحقق من عدم وجود موظف بنفس البريد الإلكتروني
    if (createEmployeeDto.email) {
      const existingByEmail = await this.prisma.hr_employees.findUnique({
        where: { email: createEmployeeDto.email },
      });

      if (existingByEmail) {
        throw new ConflictException(`البريد الإلكتروني ${createEmployeeDto.email} مستخدم مسبقاً`);
      }
    }

    // التحقق من وجود القسم إذا تم تحديده
    if (createEmployeeDto.department_id) {
      const department = await this.prisma.hr_departments.findUnique({
        where: { id: createEmployeeDto.department_id },
      });
      if (!department) {
        throw new NotFoundException(`القسم بالمعرف ${createEmployeeDto.department_id} غير موجود`);
      }
    }

    // التحقق من وجود المسمى الوظيفي إذا تم تحديده
    if (createEmployeeDto.position_id) {
      const position = await this.prisma.hr_positions.findUnique({
        where: { id: createEmployeeDto.position_id },
      });
      if (!position) {
        throw new NotFoundException(`المسمى الوظيفي بالمعرف ${createEmployeeDto.position_id} غير موجود`);
      }
    }

    // التحقق من وجود المدير إذا تم تحديده
    if (createEmployeeDto.manager_id) {
      const manager = await this.prisma.hr_employees.findUnique({
        where: { id: createEmployeeDto.manager_id },
      });
      if (!manager) {
        throw new NotFoundException(`المدير بالمعرف ${createEmployeeDto.manager_id} غير موجود`);
      }
    }

    return this.prisma.hr_employees.create({
      data: createEmployeeDto,
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async findAll(filters?: {
    status?: string;
    department_id?: string;
    position_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }

    if (filters?.position_id) {
      where.position_id = filters.position_id;
    }

    if (filters?.search) {
      where.OR = [
        { employee_number: { contains: filters.search, mode: 'insensitive' } },
        { first_name: { contains: filters.search, mode: 'insensitive' } },
        { last_name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { mobile: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [employees, total] = await Promise.all([
      this.prisma.hr_employees.findMany({
        where,
        include: {
          department: {
            select: { id: true, code: true, name: true, name_ar: true },
          },
          position: {
            select: { id: true, code: true, title: true, title_ar: true },
          },
          manager: {
            select: { id: true, employee_number: true, first_name: true, last_name: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.hr_employees.count({ where }),
    ]);

    return {
      data: employees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.hr_employees.findUnique({
      where: { id },
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
        subordinates: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
            status: true,
          },
        },
        employment_details: true,
        salary_details: true,
        leave_balances: {
          include: { leave_type: true },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException(`الموظف بالمعرف ${id} غير موجود`);
    }

    return employee;
  }

  async findByEmployeeNumber(employeeNumber: string) {
    const employee = await this.prisma.hr_employees.findUnique({
      where: { employee_number: employeeNumber },
      include: {
        department: true,
        position: true,
        employment_details: true,
        salary_details: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`الموظف بالرقم الوظيفي ${employeeNumber} غير موجود`);
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    // التحقق من وجود الموظف
    await this.findOne(id);

    // التحقق من عدم تكرار الرقم الوظيفي
    if (updateEmployeeDto.employee_number) {
      const existingByNumber = await this.prisma.hr_employees.findFirst({
        where: {
          employee_number: updateEmployeeDto.employee_number,
          NOT: { id },
        },
      });

      if (existingByNumber) {
        throw new ConflictException(`الرقم الوظيفي ${updateEmployeeDto.employee_number} مستخدم مسبقاً`);
      }
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (updateEmployeeDto.email) {
      const existingByEmail = await this.prisma.hr_employees.findFirst({
        where: {
          email: updateEmployeeDto.email,
          NOT: { id },
        },
      });

      if (existingByEmail) {
        throw new ConflictException(`البريد الإلكتروني ${updateEmployeeDto.email} مستخدم مسبقاً`);
      }
    }

    return this.prisma.hr_employees.update({
      where: { id },
      data: updateEmployeeDto,
      include: {
        department: true,
        position: true,
        manager: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    // التحقق من وجود الموظف
    const employee = await this.findOne(id);

    // التحقق من عدم وجود مرؤوسين
    const subordinatesCount = await this.prisma.hr_employees.count({
      where: { manager_id: id },
    });

    if (subordinatesCount > 0) {
      throw new ConflictException(`لا يمكن حذف الموظف لأنه مدير لـ ${subordinatesCount} موظف`);
    }

    // حذف البيانات المرتبطة أولاً
    await this.prisma.$transaction([
      this.prisma.hr_employment_details.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_salary_details.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_employee_leave_balances.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_leave_requests.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_attendance_records.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_employee_loans.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_payroll_details.deleteMany({ where: { employee_id: id } }),
      this.prisma.hr_employees.delete({ where: { id } }),
    ]);

    return { message: 'تم حذف الموظف بنجاح' };
  }

  // بيانات التوظيف
  async createEmploymentDetails(dto: CreateEmploymentDetailsDto) {
    // التحقق من وجود الموظف
    const employee = await this.prisma.hr_employees.findUnique({
      where: { id: dto.employee_id },
    });

    if (!employee) {
      throw new NotFoundException(`الموظف بالمعرف ${dto.employee_id} غير موجود`);
    }

    // التحقق من عدم وجود بيانات توظيف مسبقة
    const existingDetails = await this.prisma.hr_employment_details.findUnique({
      where: { employee_id: dto.employee_id },
    });

    if (existingDetails) {
      throw new ConflictException('بيانات التوظيف موجودة مسبقاً لهذا الموظف');
    }

    return this.prisma.hr_employment_details.create({
      data: dto,
      include: { employee: true },
    });
  }

  async updateEmploymentDetails(employeeId: string, dto: Partial<CreateEmploymentDetailsDto>) {
    const existingDetails = await this.prisma.hr_employment_details.findUnique({
      where: { employee_id: employeeId },
    });

    if (!existingDetails) {
      throw new NotFoundException('بيانات التوظيف غير موجودة لهذا الموظف');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { employee_id, ...updateData } = dto;

    return this.prisma.hr_employment_details.update({
      where: { employee_id: employeeId },
      data: updateData,
      include: { employee: true },
    });
  }

  // إحصائيات الموظفين
  async getStatistics() {
    const [
      totalEmployees,
      activeEmployees,
      byDepartment,
      byStatus,
      recentHires,
    ] = await Promise.all([
      this.prisma.hr_employees.count(),
      this.prisma.hr_employees.count({ where: { status: 'active' } }),
      this.prisma.hr_employees.groupBy({
        by: ['department_id'],
        _count: { id: true },
        where: { department_id: { not: null } },
      }),
      this.prisma.hr_employees.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.hr_employees.findMany({
        where: { status: 'active' },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          employee_number: true,
          first_name: true,
          last_name: true,
          created_at: true,
          department: { select: { name: true } },
        },
      }),
    ]);

    // جلب أسماء الأقسام
    const departmentIds = byDepartment.map((d) => d.department_id).filter(Boolean) as string[];
    const departments = await this.prisma.hr_departments.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true, name_ar: true },
    });

    const departmentMap = new Map(departments.map((d) => [d.id, d]));

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      byDepartment: byDepartment.map((d) => ({
        department: departmentMap.get(d.department_id as string),
        count: d._count.id,
      })),
      byStatus: byStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      recentHires,
    };
  }
}
