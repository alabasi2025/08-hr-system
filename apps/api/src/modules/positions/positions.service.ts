import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    // التحقق من عدم وجود مسمى وظيفي بنفس الكود
    const existingPosition = await this.prisma.hr_positions.findUnique({
      where: { code: createPositionDto.code },
    });

    if (existingPosition) {
      throw new ConflictException(`المسمى الوظيفي بالكود ${createPositionDto.code} موجود مسبقاً`);
    }

    // التحقق من وجود القسم إذا تم تحديده
    if (createPositionDto.department_id) {
      const department = await this.prisma.hr_departments.findUnique({
        where: { id: createPositionDto.department_id },
      });
      if (!department) {
        throw new NotFoundException(`القسم بالمعرف ${createPositionDto.department_id} غير موجود`);
      }
    }

    // التحقق من وجود سلم الرواتب إذا تم تحديده
    if (createPositionDto.grade_id) {
      const grade = await this.prisma.hr_salary_grades.findUnique({
        where: { id: createPositionDto.grade_id },
      });
      if (!grade) {
        throw new NotFoundException(`سلم الرواتب بالمعرف ${createPositionDto.grade_id} غير موجود`);
      }
    }

    return this.prisma.hr_positions.create({
      data: createPositionDto,
      include: {
        department: true,
        grade: true,
      },
    });
  }

  async findAll(departmentId?: string, includeInactive = false) {
    const where: any = {};
    
    if (!includeInactive) {
      where.is_active = true;
    }
    
    if (departmentId) {
      where.department_id = departmentId;
    }

    return this.prisma.hr_positions.findMany({
      where,
      include: {
        department: true,
        grade: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const position = await this.prisma.hr_positions.findUnique({
      where: { id },
      include: {
        department: true,
        grade: true,
        employees: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
            status: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException(`المسمى الوظيفي بالمعرف ${id} غير موجود`);
    }

    return position;
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    // التحقق من وجود المسمى الوظيفي
    await this.findOne(id);

    // التحقق من عدم تكرار الكود
    if (updatePositionDto.code) {
      const existingPosition = await this.prisma.hr_positions.findFirst({
        where: {
          code: updatePositionDto.code,
          NOT: { id },
        },
      });

      if (existingPosition) {
        throw new ConflictException(`المسمى الوظيفي بالكود ${updatePositionDto.code} موجود مسبقاً`);
      }
    }

    return this.prisma.hr_positions.update({
      where: { id },
      data: updatePositionDto,
      include: {
        department: true,
        grade: true,
      },
    });
  }

  async remove(id: string) {
    // التحقق من وجود المسمى الوظيفي
    await this.findOne(id);

    // التحقق من عدم وجود موظفين بهذا المسمى
    const employeesCount = await this.prisma.hr_employees.count({
      where: { position_id: id },
    });

    if (employeesCount > 0) {
      throw new ConflictException(`لا يمكن حذف المسمى الوظيفي لأنه مرتبط بـ ${employeesCount} موظف`);
    }

    return this.prisma.hr_positions.delete({
      where: { id },
    });
  }
}
