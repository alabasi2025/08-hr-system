import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface Loan {
  id: string;
  loan_number: string;
  loan_type: string;
  total_amount: number;
  monthly_installment: number;
  total_installments: number;
  paid_installments: number;
  paid_amount: number;
  remaining_amount: number;
  start_date: string;
  reason: string | null;
  status: string;
  employee: {
    id: string;
    employee_number: string;
    first_name: string;
    last_name: string;
    department?: { name_ar: string; name: string };
  };
}

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
}

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">السلف والقروض</h1>
          <p class="text-gray-600">إدارة سلف وقروض الموظفين</p>
        </div>
        <button
          (click)="showCreateModal = true; loadEmployees()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة سلفة/قرض
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">إجمالي السلف</div>
          <div class="text-2xl font-bold text-gray-800">{{ stats()?.total_loans || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">السلف النشطة</div>
          <div class="text-2xl font-bold text-green-600">{{ stats()?.active_loans || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">المبلغ المتبقي</div>
          <div class="text-2xl font-bold text-yellow-600">{{ formatCurrency(stats()?.total_remaining) }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">المبلغ المسدد</div>
          <div class="text-2xl font-bold text-blue-600">{{ formatCurrency(stats()?.total_paid) }}</div>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex items-center gap-4">
          <label class="text-gray-700">الحالة:</label>
          <select
            [(ngModel)]="selectedStatus"
            (change)="loadLoans()"
            class="border rounded-lg px-3 py-2"
          >
            <option value="">الكل</option>
            <option value="pending">معلق</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      <!-- Loans Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">رقم السلفة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الموظف</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">النوع</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المبلغ</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">القسط الشهري</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الأقساط</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">المتبقي</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الحالة</th>
              <th class="px-4 py-3 text-right text-sm font-medium text-gray-600">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            @for (loan of loans(); track loan.id) {
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm">{{ loan.loan_number }}</td>
                <td class="px-4 py-3 text-sm">
                  {{ loan.employee.first_name }} {{ loan.employee.last_name }}
                  <div class="text-xs text-gray-500">{{ loan.employee.employee_number }}</div>
                </td>
                <td class="px-4 py-3 text-sm">{{ getLoanTypeLabel(loan.loan_type) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatCurrency(loan.total_amount) }}</td>
                <td class="px-4 py-3 text-sm">{{ formatCurrency(loan.monthly_installment) }}</td>
                <td class="px-4 py-3 text-sm">{{ loan.paid_installments }} / {{ loan.total_installments }}</td>
                <td class="px-4 py-3 text-sm text-yellow-600">{{ formatCurrency(loan.remaining_amount) }}</td>
                <td class="px-4 py-3">
                  <span [class]="getStatusClass(loan.status)">
                    {{ getStatusLabel(loan.status) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-2">
                    @if (loan.status === 'pending') {
                      <button
                        (click)="approveLoan(loan.id)"
                        class="text-green-600 hover:text-green-800"
                        title="اعتماد"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </button>
                      <button
                        (click)="rejectLoan(loan.id)"
                        class="text-red-600 hover:text-red-800"
                        title="رفض"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                      <button
                        (click)="deleteLoan(loan.id)"
                        class="text-gray-600 hover:text-gray-800"
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
                <td colspan="9" class="px-4 py-8 text-center text-gray-500">
                  لا توجد سلف أو قروض
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
            <h3 class="text-lg font-bold mb-4">إضافة سلفة/قرض جديد</h3>
            <form (ngSubmit)="createLoan()">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الموظف *</label>
                  <select [(ngModel)]="newLoan.employee_id" name="employee_id" required class="w-full border rounded-lg px-3 py-2">
                    <option value="">اختر الموظف</option>
                    @for (emp of employees(); track emp.id) {
                      <option [value]="emp.id">{{ emp.first_name }} {{ emp.last_name }} ({{ emp.employee_number }})</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">النوع *</label>
                  <select [(ngModel)]="newLoan.loan_type" name="loan_type" required class="w-full border rounded-lg px-3 py-2">
                    <option value="advance">سلفة</option>
                    <option value="loan">قرض</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ *</label>
                  <input type="number" [(ngModel)]="newLoan.total_amount" name="total_amount" required min="1" class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">عدد الأقساط *</label>
                  <input type="number" [(ngModel)]="newLoan.installments" name="installments" required min="1" class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية *</label>
                  <input type="date" [(ngModel)]="newLoan.start_date" name="start_date" required class="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">السبب</label>
                  <textarea [(ngModel)]="newLoan.reason" name="reason" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <button type="button" (click)="showCreateModal = false" class="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  إلغاء
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class LoansComponent implements OnInit {
  private api = inject(ApiService);

  loans = signal<Loan[]>([]);
  employees = signal<Employee[]>([]);
  stats = signal<any>(null);

  showCreateModal = false;
  selectedStatus = '';

  newLoan = {
    employee_id: '',
    loan_type: 'advance',
    total_amount: 0,
    installments: 1,
    start_date: '',
    reason: '',
  };

  ngOnInit() {
    this.loadLoans();
    this.loadStats();
  }

  loadLoans() {
    this.api.getLoans(this.selectedStatus).subscribe({
      next: (data) => this.loans.set(data),
      error: (err) => console.error('Error loading loans:', err),
    });
  }

  loadStats() {
    this.api.getLoanStats().subscribe({
      next: (data) => this.stats.set(data),
      error: (err) => console.error('Error loading stats:', err),
    });
  }

  loadEmployees() {
    this.api.getEmployees().subscribe({
      next: (res) => this.employees.set(res.data),
      error: (err) => console.error('Error loading employees:', err),
    });
  }

  createLoan() {
    this.api.createLoan(this.newLoan).subscribe({
      next: () => {
        this.showCreateModal = false;
        this.loadLoans();
        this.loadStats();
        this.resetForm();
      },
      error: (err) => alert(err.error?.message || 'حدث خطأ'),
    });
  }

  approveLoan(id: string) {
    if (confirm('هل تريد اعتماد هذه السلفة/القرض؟')) {
      this.api.approveLoan(id).subscribe({
        next: () => {
          this.loadLoans();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  rejectLoan(id: string) {
    const reason = prompt('سبب الرفض:');
    if (reason !== null) {
      this.api.rejectLoan(id, reason).subscribe({
        next: () => {
          this.loadLoans();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  deleteLoan(id: string) {
    if (confirm('هل تريد حذف هذه السلفة/القرض؟')) {
      this.api.deleteLoan(id).subscribe({
        next: () => {
          this.loadLoans();
          this.loadStats();
        },
        error: (err) => alert(err.error?.message || 'حدث خطأ'),
      });
    }
  }

  resetForm() {
    this.newLoan = {
      employee_id: '',
      loan_type: 'advance',
      total_amount: 0,
      installments: 1,
      start_date: '',
      reason: '',
    };
  }

  getLoanTypeLabel(type: string): string {
    return type === 'advance' ? 'سلفة' : 'قرض';
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
      active: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
      completed: 'px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800',
      cancelled: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
    };
    return classes[status] || classes['pending'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'معلق',
      active: 'نشط',
      completed: 'مكتمل',
      cancelled: 'ملغي',
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
