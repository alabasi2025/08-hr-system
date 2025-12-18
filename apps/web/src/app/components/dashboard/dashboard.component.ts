import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { EmployeeStatistics, Department } from '../../models/employee.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">لوحة التحكم</h1>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="mr-4">
              <p class="text-sm text-gray-500">إجمالي الموظفين</p>
              <p class="text-2xl font-bold text-gray-800">{{ statistics()?.totalEmployees || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="mr-4">
              <p class="text-sm text-gray-500">الموظفين النشطين</p>
              <p class="text-2xl font-bold text-green-600">{{ statistics()?.activeEmployees || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="mr-4">
              <p class="text-sm text-gray-500">عدد الأقسام</p>
              <p class="text-2xl font-bold text-purple-600">{{ departments().length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="mr-4">
              <p class="text-sm text-gray-500">التعيينات الجديدة</p>
              <p class="text-2xl font-bold text-yellow-600">{{ statistics()?.recentHires?.length || 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Employees by Department -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-800 mb-4">الموظفين حسب القسم</h2>
          @if (statistics()?.byDepartment?.length) {
            <div class="space-y-4">
              @for (item of statistics()!.byDepartment; track item.department.id) {
                <div>
                  <div class="flex justify-between mb-1">
                    <span class="text-sm text-gray-600">{{ item.department.name_ar || item.department.name }}</span>
                    <span class="text-sm font-medium text-gray-800">{{ item.count }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div
                      class="bg-blue-600 h-2 rounded-full"
                      [style.width.%]="getPercentage(item.count)"
                    ></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-gray-500 text-center py-4">لا توجد بيانات</p>
          }
        </div>

        <!-- Recent Hires -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-800">أحدث التعيينات</h2>
            <a routerLink="/employees" class="text-blue-600 hover:text-blue-800 text-sm">عرض الكل</a>
          </div>
          @if (statistics()?.recentHires?.length) {
            <div class="space-y-4">
              @for (employee of statistics()!.recentHires; track employee.id) {
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="text-blue-600 font-medium">{{ employee.first_name[0] }}</span>
                  </div>
                  <div class="mr-3 flex-1">
                    <p class="text-sm font-medium text-gray-800">{{ employee.first_name }} {{ employee.last_name }}</p>
                    <p class="text-xs text-gray-500">{{ employee.department?.name || 'بدون قسم' }}</p>
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ formatDate(employee.created_at) }}
                  </div>
                </div>
              }
            </div>
          } @else {
            <p class="text-gray-500 text-center py-4">لا توجد تعيينات حديثة</p>
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            routerLink="/employees/new"
            class="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            <span class="text-sm text-gray-700">إضافة موظف</span>
          </a>
          <a
            routerLink="/departments"
            class="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            <span class="text-sm text-gray-700">إدارة الأقسام</span>
          </a>
          <a
            routerLink="/positions"
            class="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span class="text-sm text-gray-700">المسميات الوظيفية</span>
          </a>
          <a
            routerLink="/salary-grades"
            class="flex flex-col items-center p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
            <svg class="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-sm text-gray-700">سلم الرواتب</span>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  statistics = signal<EmployeeStatistics | null>(null);
  departments = signal<Department[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getEmployeeStatistics().subscribe({
      next: (stats) => this.statistics.set(stats),
      error: (err) => console.error('Error loading statistics:', err)
    });

    this.api.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts),
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  getPercentage(count: number): number {
    const total = this.statistics()?.totalEmployees || 1;
    return (count / total) * 100;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }
}
