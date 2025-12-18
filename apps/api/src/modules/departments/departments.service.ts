import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto) {
    // التحقق من عدم وجود قسم بنفس الكود
    const existingDepartment = await this.prisma.hr_departments.findUnique({
      where: { code: createDepartmentDto.code },
    });

    if (existingDepartment) {
      throw new ConflictException(`القسم بالكود ${createDepartmentDto.code} موجود مسبقاً`);
    }

    return this.prisma.hr_departments.create({
      data: createDepartmentDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll(includeInactive = false) {
    const where = includeInactive ? {} : { is_active: true };
    
    return this.prisma.hr_departments.findMany({
      where,
      include: {
        parent: true,
        children: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.hr_departments.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        employees: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
            status: true,
          },
        },
        positions: true,
      },
    });

    if (!department) {
      throw new NotFoundException(`القسم بالمعرف ${id} غير موجود`);
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    // التحقق من وجود القسم
    await this.findOne(id);

    // التحقق من عدم تكرار الكود
    if (updateDepartmentDto.code) {
      const existingDepartment = await this.prisma.hr_departments.findFirst({
        where: {
          code: updateDepartmentDto.code,
          NOT: { id },
        },
      });

      if (existingDepartment) {
        throw new ConflictException(`القسم بالكود ${updateDepartmentDto.code} موجود مسبقاً`);
      }
    }

    return this.prisma.hr_departments.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    // التحقق من وجود القسم
    const department = await this.findOne(id);

    // التحقق من عدم وجود موظفين في القسم
    const employeesCount = await this.prisma.hr_employees.count({
      where: { department_id: id },
    });

    if (employeesCount > 0) {
      throw new ConflictException(`لا يمكن حذف القسم لأنه يحتوي على ${employeesCount} موظف`);
    }

    // التحقق من عدم وجود أقسام فرعية
    const childrenCount = await this.prisma.hr_departments.count({
      where: { parent_id: id },
    });

    if (childrenCount > 0) {
      throw new ConflictException(`لا يمكن حذف القسم لأنه يحتوي على ${childrenCount} قسم فرعي`);
    }

    return this.prisma.hr_departments.delete({
      where: { id },
    });
  }

  async getHierarchy() {
    // جلب الأقسام الجذرية (بدون parent)
    const rootDepartments = await this.prisma.hr_departments.findMany({
      where: {
        parent_id: null,
        is_active: true,
      },
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    return rootDepartments;
  }
}
