import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoanDto, UpdateLoanDto } from './dto/create-loan.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LoansService {
  constructor(private prisma: PrismaService) {}

  // إنشاء سلفة/قرض جديد
  async create(dto: CreateLoanDto) {
    // التحقق من وجود الموظف
    const employee = await this.prisma.hr_employees.findUnique({
      where: { id: dto.employee_id },
      include: { salary_details: true },
    });

    if (!employee) {
      throw new NotFoundException('الموظف غير موجود');
    }

    // حساب القسط الشهري
    const monthlyInstallment = new Decimal(dto.total_amount).dividedBy(dto.installments).toDecimalPlaces(2);

    // إنشاء رقم السلفة/القرض
    const count = await this.prisma.hr_employee_loans.count();
    const loanNumber = `${dto.loan_type === 'advance' ? 'ADV' : 'LN'}-${String(count + 1).padStart(6, '0')}`;

    return this.prisma.hr_employee_loans.create({
      data: {
        loan_number: loanNumber,
        employee_id: dto.employee_id,
        loan_type: dto.loan_type,
        total_amount: new Decimal(dto.total_amount),
        installment_amount: monthlyInstallment,
        number_of_installments: dto.installments,
        amount: new Decimal(dto.total_amount),
        paid_amount: new Decimal(0),
        remaining_amount: new Decimal(dto.total_amount),
        start_date: new Date(dto.start_date),
        notes: dto.reason || dto.notes,
        status: 'pending',
      },
      include: {
        employee: {
          select: {
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  // جلب جميع السلف والقروض
  async findAll(status?: string, employeeId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employee_id = employeeId;

    return this.prisma.hr_employee_loans.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
            department: { select: { name_ar: true, name: true } },
          },
        },
      },
    });
  }

  // جلب سلفة/قرض واحد
  async findOne(id: string) {
    const loan = await this.prisma.hr_employee_loans.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            employee_number: true,
            first_name: true,
            last_name: true,
            department: { select: { name_ar: true, name: true } },
            position: { select: { title_ar: true, title: true } },
            salary_details: true,
          },
        },
      },
    });

    if (!loan) {
      throw new NotFoundException('السلفة/القرض غير موجود');
    }

    return loan;
  }

  // جلب سلف موظف معين
  async findByEmployee(employeeId: string) {
    return this.prisma.hr_employee_loans.findMany({
      where: { employee_id: employeeId },
      orderBy: { created_at: 'desc' },
    });
  }

  // اعتماد السلفة/القرض
  async approve(id: string, userId?: string, notes?: string) {
    const loan = await this.prisma.hr_employee_loans.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('السلفة/القرض غير موجود');
    }

    if (loan.status !== 'pending') {
      throw new BadRequestException('لا يمكن اعتماد سلفة/قرض غير معلق');
    }

    return this.prisma.hr_employee_loans.update({
      where: { id },
      data: {
        status: 'active',
        approved_by: userId,
        approved_at: new Date(),
        notes: notes || loan.notes,
      },
      include: {
        employee: {
          select: {
            employee_number: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });
  }

  // رفض السلفة/القرض
  async reject(id: string, reason?: string) {
    const loan = await this.prisma.hr_employee_loans.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('السلفة/القرض غير موجود');
    }

    if (loan.status !== 'pending') {
      throw new BadRequestException('لا يمكن رفض سلفة/قرض غير معلق');
    }

    return this.prisma.hr_employee_loans.update({
      where: { id },
      data: {
        status: 'cancelled',
        notes: reason || 'تم الرفض',
      },
    });
  }

  // تحديث السلفة/القرض
  async update(id: string, dto: UpdateLoanDto) {
    const loan = await this.prisma.hr_employee_loans.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('السلفة/القرض غير موجود');
    }

    return this.prisma.hr_employee_loans.update({
      where: { id },
      data: dto,
    });
  }

  // حذف السلفة/القرض (فقط المعلقة)
  async remove(id: string) {
    const loan = await this.prisma.hr_employee_loans.findUnique({
      where: { id },
    });

    if (!loan) {
      throw new NotFoundException('السلفة/القرض غير موجود');
    }

    if (loan.status !== 'pending') {
      throw new BadRequestException('لا يمكن حذف سلفة/قرض معتمد أو نشط');
    }

    return this.prisma.hr_employee_loans.delete({
      where: { id },
    });
  }

  // إحصائيات السلف والقروض
  async getStats() {
    const loans = await this.prisma.hr_employee_loans.findMany();

    const totalLoans = loans.length;
    const activeLoans = loans.filter(l => l.status === 'active').length;
    const pendingLoans = loans.filter(l => l.status === 'pending').length;
    const completedLoans = loans.filter(l => l.status === 'completed').length;

    const totalAmount = loans
      .filter(l => l.status === 'active' || l.status === 'completed')
      .reduce((sum, l) => sum.plus(new Decimal(l.total_amount)), new Decimal(0));

    const totalPaid = loans
      .reduce((sum, l) => sum.plus(new Decimal(l.paid_amount)), new Decimal(0));

    const totalRemaining = loans
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum.plus(new Decimal(l.remaining_amount)), new Decimal(0));

    return {
      total_loans: totalLoans,
      active_loans: activeLoans,
      pending_loans: pendingLoans,
      completed_loans: completedLoans,
      total_amount: totalAmount,
      total_paid: totalPaid,
      total_remaining: totalRemaining,
    };
  }
}
