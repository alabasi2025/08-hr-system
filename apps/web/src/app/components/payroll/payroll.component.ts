import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface PayrollRun {
  id: string;
  payroll_number: string;
  period_year: number;
  period_month: number;
  start_date: string;
  end_date: string;
  payment_date: string | null;
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  status: string;
  calculated_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  details?: PayrollDetail[];
}

interface PayrollDetail {
  id: string;
  employee: {
    employee_number: string;
    first_name: string;
    last_name: string;
    department?: { name_ar: string; name: string };
    position?: { title_ar: string; title: string };
  };
  basic_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  status: string;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">مسير الرواتب</h1>
          <p class="text-gray-600">إدارة مسيرات الرواتب الشهرية</p>
        </div>
        <button
          (click)="showCreateModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إنشاء مسير جديد
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">إجمالي المسيرات</div>
          <div class="text-2xl font-bold text-gray-800">{{ stats()?.total_payrolls || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">المسيرات المدفوعة</div>
          <div class="text-2xl font-bold text-green-600">{{ stats()?.paid_payrolls || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">المسيرات المعلقة</div>
          <div class="text-2xl font-bold text-yellow-600">{{ stats()?.pending_payrolls || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">إجمالي المدفوعات</div>
          <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(stats()?.total_paid_amount) }}</div>
        </div>
      </div>

      <!-- Year Filter -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center gap-4">
          <label class="text-gray-700">السنة:</label>
          <select
            [(ngModel)]="selectedYear"
            (change)="loadPayrolls()"
            class="border rounded-lg px-3 py-2"
          >
            @for (year of years; track year) {
              <option [value]="year">{{ year }}</option>
            }
          </select>
        </div>
      </div>

      <!-- Payrolls Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم المسير</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الفترة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">عدد الموظفين</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">إجمالي الرواتب</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الخصومات</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الصافي</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (payroll of payrolls(); track payroll.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">{{ payroll.payroll_number }}</td>
                <td class="px-4 py-3 text-sm">{{ getMonthName(payroll.period_month) }} {{ payroll.period_year }}</td>
                <td class="px-4 py-3 text-sm">{{ payroll.total_employees }}</td>
                <td class="px-4 py-3 text-sm">{{ formatCurrency(payroll.total_gross) }}</td>
                <td class="px-4 py-3 text-sm text-red-600">{{ formatCurrency(payroll.total_deductions) }}</td>
                <td class="px-4 py-3 text-sm font-medium">{{ formatCurrency(payroll.total_net) }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(payroll.status)">
                    {{ getStatusLabel(payroll.status) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    <button
                      (click)="viewDetails(payroll)"
                      class="text-blue-600 hover:text-blue-800"
                      title="عرض التفاصيل"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    @if (payroll.status === 'draft') {
                      <button
                        (click)="calculatePayroll(payroll.id)"
                        class="text-green-600 hover:text-green-800"
                        title="حساب الرواتب"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </button>
                    }
                    @if (payroll.status === 'calculated') {
                      <button
                        (click)="approvePayroll(payroll.id)"
                        class="text-yellow-600 hover:text-yellow-800"
                        title="اعتماد المسير"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </button>
                    }
                    @if (payroll.status === 'approved') {
                      <button
                        (click)="markAsPaid(payroll.id)"
                        class="text-purple-600 hover:text-purple-800"
                        title="تأكيد الدفع"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </button>
                    }
                    @if (payroll.status === 'draft') {
                      <button
                        (click)="deletePayroll(payroll.id)"
                        class="text-red-600 hover:text-red-800"
                        title="حذف"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                  لا توجد مسيرات رواتب
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Create Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold mb-4">إنشاء مسير رواتب جديد</h3>
            <form (ngSubmit)="createPayroll()">
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">السنة</label>
                    <select [(ngModel)]="newPayroll.period_year" name="year" class="w-full border rounded-lg px-3 py-2">
                      @for (year of years; track year) {
                        <option [value]="year">{{ year }}</option>
                      }
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">الشهر</label>
                    <select [(ngModel)]="newPayroll.period_month" name="month" class="w-full border rounded-lg px-3 py-2">
                      @for (month of months; track month.value) {
                        <option [value]="month.value">{{ month.label }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input type="date" [(ngModel)]="newPayroll.start_date" name="start_date" class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input type="date" [(ngModel)]="newPayroll.end_date" name="end_date" class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea [(ngModel)]="newPayroll.notes" name="notes" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showCreateModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  إلغاء
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  إنشاء
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Details Modal -->
      @if (showDetailsModal && selectedPayroll()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">تفاصيل مسير الرواتب - {{ selectedPayroll()?.payroll_number }}</h3>
              <button (click)="showDetailsModal = false" class="text-gray-500 hover:text-gray-700">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-600">الموظف</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-600">الراتب الأساسي</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-600">الاستحقاقات</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-600">الخصومات</th>
                  <th class="px-3 py-2 text-right text-xs font-medium text-gray-600">الصافي</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (detail of selectedPayroll()?.details; track detail.id) {
                  <tr>
                    <td class="px-3 py-2 text-sm">
                      {{ detail.employee.first_name }} {{ detail.employee.last_name }}
                      <div class="text-xs text-gray-500">{{ detail.employee.employee_number }}</div>
                    </td>
                    <td class="px-3 py-2 text-sm">{{ formatCurrency(detail.basic_salary) }}</td>
                    <td class="px-3 py-2 text-sm text-green-600">{{ formatCurrency(detail.total_earnings) }}</td>
                    <td class="px-3 py-2 text-sm text-red-600">{{ formatCurrency(detail.total_deductions) }}</td>
                    <td class="px-3 py-2 text-sm font-medium">{{ formatCurrency(detail.net_salary) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `,
})
export class PayrollComponent implements OnInit {
  private api = inject(ApiService);

  payrolls = signal<PayrollRun[]>([]);
  stats = signal<any>(null);
  selectedPayroll = signal<PayrollRun | null>(null);

  showCreateModal = false;
  showDetailsModal = false;
  selectedYear = new Date().getFullYear();

  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i + 1);
  months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' },
  ];

  newPayroll = {
    period_year: new Date().getFullYear(),
    period_month: new Date().getMonth() + 1,
    start_date: '',
    end_date: '',
    notes: '',
  };

  ngOnInit() {
    this.loadPayrolls();
    this.loadStats();
    this.setDefaultDates();
  }

  setDefaultDates() {
    const year = this.newPayroll.period_year;
    const month = this.newPayroll.period_month;
    this.newPayroll.start_date = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    this.newPayroll.end_date = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
  }

  loadPayrolls() {
    this.api.getPayrolls(this.selectedYear).subscribe({
      next: (data) => this.payrolls.set(data),
      error: (err) => console.error('Error loading payrolls:', err),
    });
  }

  loadStats() {
    this.api.getPayrollStats(this.selectedYear).subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  createPayroll() {
    this.api.createPayroll(this.newPayroll).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadPayrolls();
        this.loadStats();
      },
      error: (err) => alert(err.error?.message || 'حدث خطأ'),
    });
  }

  calculatePayroll(id: string) {
    if (confirm('هل تريد حساب رواتب جميع الموظفين؟')) {
      this.api.calculatePayroll(id).subscribe({
        next: () => {
          this.loadPayrolls();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  approvePayroll(id: string) {
    if (confirm('هل تريد اعتماد مسير الرواتب؟')) {
      this.api.approvePayroll(id).subscribe({
        next: () => {
          this.loadPayrolls();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  markAsPaid(id: string) {
    if (confirm('هل تريد تأكيد دفع مسير الرواتب؟ سيتم خصم أقساط السلف تلقائياً.')) {
      this.api.markPayrollAsPaid(id).subscribe({
        next: () => {
          this.loadPayrolls();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  deletePayroll(id: string) {
    if (confirm('هل تريد حذف مسير الرواتب؟')) {
      this.api.deletePayroll(id).subscribe({
        next: () => {
          this.loadPayrolls();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  viewDetails(payroll: PayrollRun) {
    this.api.getPayroll(payroll.id).subscribe({
      next: (data) => {
        this.selectedPayroll.set(data);
        this.showDetailsModal = true;
      },
      error: (err) => console.error('Error loading details:', err),
    });
  }

  getMonthName(month: number): string {
    return this.months.find((m) => m.value === month)?.label || '';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      draft: 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800',
      calculated: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      approved: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      paid: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    };
    return classes[status] || classes['draft'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      draft: 'مسودة',
      calculated: 'محسوب',
      approved: 'معتمد',
      paid: 'مدفوع',
    };
    return labels[status] || status;
  }

  formatCurrency(value: any): string {
    if (!value) return '0 ر.ي';
    return new Intl.NumberFormat('ar-YE', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value)) + ' ر.ي';
  }
}
