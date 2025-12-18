import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Employee, Department, Position } from '../../models/employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p class="text-gray-600">قائمة جميع الموظفين في النظام</p>
        </div>
        <button
          routerLink="/employees/new"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة موظف جديد
        </button>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">إجمالي الموظفين</div>
          <div class="text-2xl font-bold text-gray-800">{{ statistics()?.totalEmployees || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">الموظفين النشطين</div>
          <div class="text-2xl font-bold text-green-600">{{ statistics()?.activeEmployees || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">الموظفين غير النشطين</div>
          <div class="text-2xl font-bold text-red-600">{{ statistics()?.inactiveEmployees || 0 }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-4">
          <div class="text-gray-500 text-sm">عدد الأقسام</div>
          <div class="text-2xl font-bold text-blue-600">{{ departments().length }}</div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearch()"
              placeholder="ابحث بالاسم أو الرقم الوظيفي..."
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">القسم</label>
            <select
              [(ngModel)]="selectedDepartment"
              (ngModelChange)="onFilterChange()"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الأقسام</option>
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.id">{{ dept.name_ar || dept.name }}</option>
              }
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="terminated">منتهي</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="resetFilters()"
              class="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              إعادة تعيين
            </button>
          </div>
        </div>
      </div>

      <!-- Employees Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        } @else if (employees().length === 0) {
          <div class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p class="mt-4 text-gray-600">لا يوجد موظفين</p>
            <button
              routerLink="/employees/new"
              class="mt-4 text-blue-600 hover:text-blue-800"
            >
              إضافة موظف جديد
            </button>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الموظف</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرقم الوظيفي</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسمى الوظيفي</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (employee of employees(); track employee.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="flex-shrink-0 h-10 w-10">
                        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-blue-600 font-medium">{{ employee.first_name[0] }}</span>
                        </div>
                      </div>
                      <div class="mr-4">
                        <div class="text-sm font-medium text-gray-900">{{ employee.first_name }} {{ employee.last_name }}</div>
                        <div class="text-sm text-gray-500">{{ employee.email || employee.mobile }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ employee.employee_number }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ employee.department?.name_ar || employee.department?.name || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ employee.position?.title_ar || employee.position?.title || '-' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getStatusClass(employee.status)">
                      {{ getStatusLabel(employee.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <a [routerLink]="['/employees', employee.id]" class="text-blue-600 hover:text-blue-900">عرض</a>
                      <a [routerLink]="['/employees', employee.id, 'edit']" class="text-green-600 hover:text-green-900">تعديل</a>
                      <button (click)="deleteEmployee(employee)" class="text-red-600 hover:text-red-900">حذف</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private api = inject(ApiService);

  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  statistics = signal<any>(null);
  loading = signal(true);

  searchTerm = '';
  selectedDepartment = '';
  selectedStatus = '';

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    // Load employees
    this.api.getEmployees({
      search: this.searchTerm || undefined,
      department_id: this.selectedDepartment || undefined,
      status: this.selectedStatus || undefined,
    }).subscribe({
      next: (response) => {
        this.employees.set(response.data || response as any);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading employees:', err);
        this.loading.set(false);
      }
    });

    // Load departments
    this.api.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts),
      error: (err) => console.error('Error loading departments:', err)
    });

    // Load statistics
    this.api.getEmployeeStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (err) => console.error('Error loading statistics:', err)
    });
  }

  onSearch() {
    this.loadData();
  }

  onFilterChange() {
    this.loadData();
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.selectedStatus = '';
    this.loadData();
  }

  deleteEmployee(employee: Employee) {
    if (confirm(`هل أنت متأكد من حذف الموظف ${employee.first_name} ${employee.last_name}؟`)) {
      this.api.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          alert(err.error?.message || 'حدث خطأ أثناء الحذف');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      active: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800',
      inactive: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800',
      terminated: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800',
      suspended: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800',
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
}
