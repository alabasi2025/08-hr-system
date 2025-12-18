import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  // إنشاء مسير رواتب جديد
  async create(dto: CreatePayrollDto) {
    // التحقق من عدم وجود مسير لنفس الفترة
    const existing = await this.prisma.hr_payroll_runs.findFirst({
      where: {
        period_year: dto.period_year,
        period_month: dto.period_month,
      },
    });

    if (existing) {
      throw new BadRequestException(`يوجد مسير رواتب لهذه الفترة بالفعل: ${dto.period_year}/${dto.period_month}`);
    }

    // إنشاء رقم المسير
    const payrollNumber = `PAY-${dto.period_year}-${String(dto.period_month).padStart(2, '0')}`;

    return this.prisma.hr_payroll_runs.create({
      data: {
        payroll_number: payrollNumber,
        period_year: dto.period_year,
        period_month: dto.period_month,
        start_date: new Date(dto.start_date),
        end_date: new Date(dto.end_date),
        payment_date: dto.payment_date ? new Date(dto.payment_date) : null,
        notes: dto.notes,
        status: 'draft',
      },
    });
  }

  // جلب جميع مسيرات الرواتب
  async findAll(year?: number) {
    const where = year ? { period_year: year } : {};
    return this.prisma.hr_payroll_runs.findMany({
      where,
      orderBy: [{ period_year: 'desc' }, { period_month: 'desc' }],
      include: {
        _count: {
          select: { details: true },
        },
      },
    });
  }

  // جلب مسير رواتب واحد مع التفاصيل
  async findOne(id: string) {
    const payroll = await this.prisma.hr_payroll_runs.findUnique({
      where: { id },
      include: {
        details: {
          include: {
            employee: {
              select: {
                id: true,
                employee_number: true,
                first_name: true,
                last_name: true,
                department: { select: { name_ar: true, name: true } },
                position: { select: { title_ar: true, title: true } },
              },
            },
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('مسير الرواتب غير موجود');
    }

    return payroll;
  }

  // حساب مسير الرواتب
  async calculate(payrollId: string, userId?: string) {
    const payroll = await this.prisma.hr_payroll_runs.findUnique({
      where: { id: payrollId },
    });

    if (!payroll) {
      throw new NotFoundException('مسير الرواتب غير موجود');
    }

    if (payroll.status !== 'draft') {
      throw new BadRequestException('لا يمكن حساب مسير رواتب معتمد أو مدفوع');
    }

    // جلب جميع الموظفين النشطين مع بيانات الراتب
    const employees = await this.prisma.hr_employees.findMany({
      where: { status: 'active' },
      include: {
        salary_details: true,
        loans: {
          where: {
            status: 'active',
            remaining_amount: { gt: 0 },
          },
        },
      },
    });

    // حذف التفاصيل القديمة إن وجدت
    await this.prisma.hr_payroll_details.deleteMany({
      where: { payroll_id: payrollId },
    });

    let totalGross = new Decimal(0);
    let totalDeductions = new Decimal(0);
    let totalNet = new Decimal(0);

    // حساب راتب كل موظف
    for (const employee of employees) {
      if (!employee.salary_details) continue;

      const salary = employee.salary_details;

      // حساب الاستحقاقات
      const basicSalary = new Decimal(salary.basic_salary);
      const housingAllowance = new Decimal(salary.housing_allowance);
      const transportAllowance = new Decimal(salary.transport_allowance);
      const foodAllowance = new Decimal(salary.food_allowance);
      const otherAllowances = new Decimal(salary.other_allowances || 0);

      const totalEarnings = basicSalary
        .plus(housingAllowance)
        .plus(transportAllowance)
        .plus(foodAllowance)
        .plus(otherAllowances);

      // حساب الخصومات
      const socialInsurance = new Decimal(salary.social_insurance || 0);
      const taxDeduction = new Decimal(salary.tax_deduction || 0);

      // حساب خصم السلف والقروض
      let loanDeduction = new Decimal(0);
      for (const loan of employee.loans) {
        loanDeduction = loanDeduction.plus(new Decimal(loan.installment_amount));
      }

      const totalDeductionsForEmployee = socialInsurance
        .plus(taxDeduction)
        .plus(loanDeduction);

      const netSalary = totalEarnings.minus(totalDeductionsForEmployee);

      // إنشاء تفاصيل الراتب
      await this.prisma.hr_payroll_details.create({
        data: {
          payroll_id: payrollId,
          employee_id: employee.id,
          working_days: 30,
          actual_days: 30,
          absent_days: 0,
          basic_salary: basicSalary,
          housing_allowance: housingAllowance,
          transport_allowance: transportAllowance,
          food_allowance: foodAllowance,
          other_allowances: otherAllowances,
          total_earnings: totalEarnings,
          social_insurance: socialInsurance,
          tax_deduction: taxDeduction,
          loan_deduction: loanDeduction,
          total_deductions: totalDeductionsForEmployee,
          net_salary: netSalary,
          status: 'calculated',
        },
      });

      totalGross = totalGross.plus(totalEarnings);
      totalDeductions = totalDeductions.plus(totalDeductionsForEmployee);
      totalNet = totalNet.plus(netSalary);
    }

    // تحديث مسير الرواتب
    return this.prisma.hr_payroll_runs.update({
      where: { id: payrollId },
      data: {
        total_employees: employees.filter(e => e.salary_details).length,
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_net: totalNet,
        status: 'calculated',
        calculated_at: new Date(),
        calculated_by: userId,
      },
      include: {
        details: {
          include: {
            employee: {
              select: {
                employee_number: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
    });
  }

  // اعتماد مسير الرواتب
  async approve(payrollId: string, userId?: string, notes?: string) {
    const payroll = await this.prisma.hr_payroll_runs.findUnique({
      where: { id: payrollId },
    });

    if (!payroll) {
      throw new NotFoundException('مسير الرواتب غير موجود');
    }

    if (payroll.status !== 'calculated') {
      throw new BadRequestException('يجب حساب مسير الرواتب قبل اعتماده');
    }

    return this.prisma.hr_payroll_runs.update({
      where: { id: payrollId },
      data: {
        status: 'approved',
        approved_at: new Date(),
        approved_by: userId,
        notes: notes || payroll.notes,
      },
    });
  }

  // تأكيد دفع مسير الرواتب
  async markAsPaid(payrollId: string) {
    const payroll = await this.prisma.hr_payroll_runs.findUnique({
      where: { id: payrollId },
      include: {
        details: {
          include: {
            employee: {
              include: {
                loans: {
                  where: {
                    status: 'active',
                    remaining_amount: { gt: 0 },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payroll) {
      throw new NotFoundException('مسير الرواتب غير موجود');
    }

    if (payroll.status !== 'approved') {
      throw new BadRequestException('يجب اعتماد مسير الرواتب قبل تأكيد الدفع');
    }

    // تحديث أقساط السلف والقروض
    for (const detail of payroll.details) {
      if (detail.loan_deduction.greaterThan(0)) {
        for (const loan of detail.employee.loans) {
          const newPaidAmount = new Decimal(loan.paid_amount).plus(loan.installment_amount);
          const newRemainingAmount = new Decimal(loan.total_amount).minus(newPaidAmount);
          // Update paid amount

          await this.prisma.hr_employee_loans.update({
            where: { id: loan.id },
            data: {
              paid_amount: newPaidAmount,
              remaining_amount: newRemainingAmount,
              
              status: newRemainingAmount.lessThanOrEqualTo(0) ? 'completed' : 'active',
            },
          });
        }
      }
    }

    // تحديث حالة تفاصيل الرواتب
    await this.prisma.hr_payroll_details.updateMany({
      where: { payroll_id: payrollId },
      data: { status: 'paid' },
    });

    return this.prisma.hr_payroll_runs.update({
      where: { id: payrollId },
      data: {
        status: 'paid',
        paid_at: new Date(),
        payment_date: new Date(),
      },
    });
  }

  // حذف مسير رواتب (فقط المسودات)
  async remove(id: string) {
    const payroll = await this.prisma.hr_payroll_runs.findUnique({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException('مسير الرواتب غير موجود');
    }

    if (payroll.status !== 'draft') {
      throw new BadRequestException('لا يمكن حذف مسير رواتب محسوب أو معتمد');
    }

    await this.prisma.hr_payroll_details.deleteMany({
      where: { payroll_id: id },
    });

    return this.prisma.hr_payroll_runs.delete({
      where: { id },
    });
  }

  // إحصائيات مسيرات الرواتب
  async getStats(year?: number) {
    const currentYear = year || new Date().getFullYear();

    const payrolls = await this.prisma.hr_payroll_runs.findMany({
      where: { period_year: currentYear },
      orderBy: { period_month: 'asc' },
    });

    const totalPaid = payrolls
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum.plus(new Decimal(p.total_net)), new Decimal(0));

    return {
      year: currentYear,
      total_payrolls: payrolls.length,
      paid_payrolls: payrolls.filter(p => p.status === 'paid').length,
      pending_payrolls: payrolls.filter(p => p.status !== 'paid').length,
      total_paid_amount: totalPaid,
      monthly_breakdown: payrolls.map(p => ({
        month: p.period_month,
        status: p.status,
        total_net: p.total_net,
        total_employees: p.total_employees,
      })),
    };
  }
}
