import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Employee, SalaryDetails } from '../../models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">تفاصيل الموظف</h1>
          <p class="text-gray-600">عرض كامل بيانات الموظف</p>
        </div>
        <div class="flex gap-2">
          <button
            routerLink="/employees"
            class="text-gray-600 hover:text-gray-800 flex items-center gap-2 px-4 py-2 border rounded-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            العودة
          </button>
          @if (employee()) {
            <a
              [routerLink]="['/employees', employee()!.id, 'edit']"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              تعديل
            </a>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      } @else if (employee()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Profile Card -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-lg shadow p-6 text-center">
              <div class="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl font-bold text-blue-600">{{ employee()!.first_name[0] }}{{ employee()!.last_name[0] }}</span>
              </div>
              <h2 class="text-xl font-bold text-gray-800">{{ employee()!.first_name }} {{ employee()!.last_name }}</h2>
              <p class="text-gray-500">{{ employee()!.position?.title_ar || employee()!.position?.title || 'لم يحدد' }}</p>
              <p class="text-gray-400 text-sm">{{ employee()!.department?.name_ar || employee()!.department?.name || 'لم يحدد' }}</p>
              
              <div class="mt-4">
                <span [class]="getStatusClass(employee()!.status)">
                  {{ getStatusLabel(employee()!.status) }}
                </span>
              </div>

              <div class="mt-6 border-t pt-4">
                <div class="text-sm text-gray-500 mb-1">الرقم الوظيفي</div>
                <div class="font-semibold text-gray-800">{{ employee()!.employee_number }}</div>
              </div>
            </div>
          </div>

          <!-- Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- البيانات الشخصية -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">البيانات الشخصية</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-sm text-gray-500">رقم الهوية</div>
                  <div class="font-medium">{{ employee()!.id_number }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">نوع الهوية</div>
                  <div class="font-medium">{{ getIdTypeLabel(employee()!.id_type) }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">الجنس</div>
                  <div class="font-medium">{{ getGenderLabel(employee()!.gender) }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">تاريخ الميلاد</div>
                  <div class="font-medium">{{ formatDate(employee()!.date_of_birth) }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">الجنسية</div>
                  <div class="font-medium">{{ employee()!.nationality || '-' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">الحالة الاجتماعية</div>
                  <div class="font-medium">{{ getMaritalStatusLabel(employee()!.marital_status) }}</div>
                </div>
              </div>
            </div>

            <!-- معلومات الاتصال -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">معلومات الاتصال</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-sm text-gray-500">رقم الجوال</div>
                  <div class="font-medium">{{ employee()!.mobile }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">رقم الهاتف</div>
                  <div class="font-medium">{{ employee()!.phone || '-' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">البريد الإلكتروني</div>
                  <div class="font-medium">{{ employee()!.email || '-' }}</div>
                </div>
                <div class="md:col-span-3">
                  <div class="text-sm text-gray-500">العنوان</div>
                  <div class="font-medium">{{ employee()!.address || '-' }} {{ employee()!.city ? '- ' + employee()!.city : '' }}</div>
                </div>
              </div>
            </div>

            <!-- جهة الاتصال في الطوارئ -->
            <div class="bg-white rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">جهة الاتصال في الطوارئ</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div class="text-sm text-gray-500">الاسم</div>
                  <div class="font-medium">{{ employee()!.emergency_contact_name || '-' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">رقم الهاتف</div>
                  <div class="font-medium">{{ employee()!.emergency_contact_phone || '-' }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">صلة القرابة</div>
                  <div class="font-medium">{{ employee()!.emergency_contact_relation || '-' }}</div>
                </div>
              </div>
            </div>

            <!-- بيانات الراتب -->
            @if (salaryDetails()) {
              <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">بيانات الراتب</h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div class="text-sm text-gray-500">الراتب الأساسي</div>
                    <div class="font-medium text-lg">{{ formatCurrency(salaryDetails()!.basic_salary) }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">بدل السكن</div>
                    <div class="font-medium">{{ formatCurrency(salaryDetails()!.housing_allowance) }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">بدل النقل</div>
                    <div class="font-medium">{{ formatCurrency(salaryDetails()!.transport_allowance) }}</div>
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">إجمالي البدلات</div>
                    <div class="font-medium">{{ formatCurrency(getTotalAllowances()) }}</div>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
                  <div class="bg-green-50 p-4 rounded-lg">
                    <div class="text-sm text-green-600">إجمالي الراتب</div>
                    <div class="font-bold text-xl text-green-700">{{ formatCurrency(salaryDetails()!.gross_salary) }}</div>
                  </div>
                  <div class="bg-red-50 p-4 rounded-lg">
                    <div class="text-sm text-red-600">إجمالي الخصومات</div>
                    <div class="font-bold text-xl text-red-700">{{ formatCurrency(salaryDetails()!.total_deductions) }}</div>
                  </div>
                  <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-sm text-blue-600">صافي الراتب</div>
                    <div class="font-bold text-xl text-blue-700">{{ formatCurrency(salaryDetails()!.net_salary) }}</div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <p class="text-gray-600">الموظف غير موجود</p>
          <button routerLink="/employees" class="mt-4 text-blue-600 hover:text-blue-800">
            العودة للقائمة
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  employee = signal<Employee | null>(null);
  salaryDetails = signal<SalaryDetails | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEmployee(id);
    } else {
      this.router.navigate(['/employees']);
    }
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.api.getEmployee(id).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.loading.set(false);
        this.loadSalaryDetails(id);
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.loading.set(false);
      }
    });
  }

  loadSalaryDetails(employeeId: string) {
    this.api.getEmployeeSalary(employeeId).subscribe({
      next: (salary) => this.salaryDetails.set(salary),
      error: () => {} // Salary might not exist
    });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800',
      inactive: 'px-3 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800',
      terminated: 'px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800',
      suspended: 'px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800',
    };
    return classes[status] || classes['inactive'];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'نشط',
      inactive: 'غير نشط',
      terminated: 'منتهي',
      suspended: 'موقوف',
    };
    return labels[status] || status;
  }

  getIdTypeLabel(type?: string): string {
    if (!type) return '-';
    const labels: Record<string, string> = {
      national_id: 'هوية وطنية',
      passport: 'جواز سفر',
      residence: 'إقامة',
    };
    return labels[type] || type;
  }

  getGenderLabel(gender?: string): string {
    if (!gender) return '-';
    return gender === 'male' ? 'ذكر' : 'أنثى';
  }

  getMaritalStatusLabel(status?: string): string {
    if (!status) return '-';
    const labels: Record<string, string> = {
      single: 'أعزب',
      married: 'متزوج',
      divorced: 'مطلق',
      widowed: 'أرمل',
    };
    return labels[status] || status;
  }

  formatDate(date?: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA');
  }

  formatCurrency(amount?: number): string {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('ar-YE', {
      style: 'currency',
      currency: 'YER',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getTotalAllowances(): number {
    const s = this.salaryDetails();
    if (!s) return 0;
    return Number(s.housing_allowance) + Number(s.transport_allowance) + 
           Number(s.food_allowance) + Number(s.phone_allowance) + Number(s.other_allowances);
  }
}
