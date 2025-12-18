import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Department, CreateDepartmentDto } from '../../models/employee.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">إدارة الأقسام</h1>
          <p class="text-gray-600">قائمة جميع الأقسام في النظام</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة قسم جديد
        </button>
      </div>

      <!-- Departments Grid -->
      @if (loading()) {
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      } @else if (departments().length === 0) {
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p class="mt-4 text-gray-600">لا يوجد أقسام</p>
          <button (click)="openModal()" class="mt-4 text-blue-600 hover:text-blue-800">
            إضافة قسم جديد
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (dept of departments(); track dept.id) {
            <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">{{ dept.code }}</span>
                    @if (!dept.is_active) {
                      <span class="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">غير نشط</span>
                    }
                  </div>
                  <h3 class="text-lg font-semibold text-gray-800 mt-2">{{ dept.name_ar || dept.name }}</h3>
                  @if (dept.name_ar && dept.name) {
                    <p class="text-sm text-gray-500">{{ dept.name }}</p>
                  }
                </div>
                <div class="flex gap-1">
                  <button
                    (click)="editDepartment(dept)"
                    class="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    (click)="deleteDepartment(dept)"
                    class="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="mt-4 pt-4 border-t flex items-center justify-between">
                <div class="flex items-center gap-2 text-gray-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span class="text-sm">{{ dept._count?.employees || 0 }} موظف</span>
                </div>
                @if (dept.parent) {
                  <span class="text-xs text-gray-400">تابع لـ: {{ dept.parent.name_ar || dept.parent.name }}</span>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div class="p-6 border-b">
              <h2 class="text-xl font-semibold text-gray-800">
                {{ editingDepartment() ? 'تعديل القسم' : 'إضافة قسم جديد' }}
              </h2>
            </div>
            <form (ngSubmit)="saveDepartment()" class="p-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">كود القسم *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.code"
                  name="code"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: IT"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">اسم القسم (إنجليزي) *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name"
                  name="name"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: Information Technology"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">اسم القسم (عربي)</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name_ar"
                  name="name_ar"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: تقنية المعلومات"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">القسم الأب</label>
                <select
                  [(ngModel)]="formData.parent_id"
                  name="parent_id"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option [ngValue]="null">بدون قسم أب</option>
                  @for (dept of departments(); track dept.id) {
                    @if (dept.id !== editingDepartment()?.id) {
                      <option [value]="dept.id">{{ dept.name_ar || dept.name }}</option>
                    }
                  }
                </select>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  [(ngModel)]="formData.is_active"
                  name="is_active"
                  id="is_active"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="is_active" class="text-sm text-gray-700">نشط</label>
              </div>
              
              <div class="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  @if (saving()) {
                    جاري الحفظ...
                  } @else {
                    {{ editingDepartment() ? 'حفظ التعديلات' : 'إضافة' }}
                  }
                </button>
              </div>
            </form>
          </div>
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
export class DepartmentListComponent implements OnInit {
  private api = inject(ApiService);

  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingDepartment = signal<Department | null>(null);

  formData: CreateDepartmentDto = {
    code: '',
    name: '',
    name_ar: '',
    parent_id: undefined,
    is_active: true,
  };

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading.set(true);
    this.api.getDepartments(true).subscribe({
      next: (depts) => {
        this.departments.set(depts);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.loading.set(false);
      }
    });
  }

  openModal() {
    this.editingDepartment.set(null);
    this.formData = {
      code: '',
      name: '',
      name_ar: '',
      parent_id: undefined,
      is_active: true,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingDepartment.set(null);
  }

  editDepartment(dept: Department) {
    this.editingDepartment.set(dept);
    this.formData = {
      code: dept.code,
      name: dept.name,
      name_ar: dept.name_ar || '',
      parent_id: dept.parent_id || undefined,
      is_active: dept.is_active,
    };
    this.showModal.set(true);
  }

  saveDepartment() {
    if (!this.formData.code || !this.formData.name) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    this.saving.set(true);
    
    const data = { ...this.formData };
    if (!data.parent_id) {
      delete data.parent_id;
    }

    const request = this.editingDepartment()
      ? this.api.updateDepartment(this.editingDepartment()!.id, data)
      : this.api.createDepartment(data);

    request.subscribe({
      next: () => {
        this.loadDepartments();
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error saving department:', err);
        alert(err.error?.message || 'حدث خطأ أثناء الحفظ');
        this.saving.set(false);
      }
    });
  }

  deleteDepartment(dept: Department) {
    if (dept._count?.employees && dept._count.employees > 0) {
      alert('لا يمكن حذف قسم يحتوي على موظفين');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف القسم "${dept.name_ar || dept.name}"؟`)) {
      this.api.deleteDepartment(dept.id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) => {
          alert(err.error?.message || 'حدث خطأ أثناء الحذف');
        }
      });
    }
  }
}
