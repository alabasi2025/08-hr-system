import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Position, Department, CreatePositionDto } from '../../models/employee.model';

@Component({
  selector: 'app-position-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">المسميات الوظيفية</h1>
          <p class="text-gray-600">قائمة جميع المسميات الوظيفية في النظام</p>
        </div>
        <button
          (click)="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          إضافة مسمى وظيفي
        </button>
      </div>

      <!-- Filter -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="flex gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">القسم</label>
            <select
              [(ngModel)]="selectedDepartment"
              (ngModelChange)="loadPositions()"
              class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">جميع الأقسام</option>
              @for (dept of departments(); track dept.id) {
                <option [value]="dept.id">{{ dept.name_ar || dept.name }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <!-- Positions Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        @if (loading()) {
          <div class="p-8 text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p class="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        } @else if (positions().length === 0) {
          <div class="p-8 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <p class="mt-4 text-gray-600">لا يوجد مسميات وظيفية</p>
            <button (click)="openModal()" class="mt-4 text-blue-600 hover:text-blue-800">
              إضافة مسمى وظيفي جديد
            </button>
          </div>
        } @else {
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكود</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المسمى الوظيفي</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القسم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العدد المطلوب</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العدد الحالي</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (pos of positions(); track pos.id) {
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">{{ pos.code }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ pos.title_ar || pos.title }}</div>
                    @if (pos.title_ar && pos.title) {
                      <div class="text-sm text-gray-500">{{ pos.title }}</div>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ pos.department?.name_ar || pos.department?.name || '-' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ pos.headcount }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ pos.current_count }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    @if (pos.is_active) {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">نشط</span>
                    } @else {
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">غير نشط</span>
                    }
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex gap-2">
                      <button (click)="editPosition(pos)" class="text-blue-600 hover:text-blue-900">تعديل</button>
                      <button (click)="deletePosition(pos)" class="text-red-600 hover:text-red-900">حذف</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b sticky top-0 bg-white">
              <h2 class="text-xl font-semibold text-gray-800">
                {{ editingPosition() ? 'تعديل المسمى الوظيفي' : 'إضافة مسمى وظيفي جديد' }}
              </h2>
            </div>
            <form (ngSubmit)="savePosition()" class="p-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">الكود *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.code"
                    name="code"
                    required
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="مثال: DEV"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                  <select
                    [(ngModel)]="formData.department_id"
                    name="department_id"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option [ngValue]="undefined">بدون قسم</option>
                    @for (dept of departments(); track dept.id) {
                      <option [value]="dept.id">{{ dept.name_ar || dept.name }}</option>
                    }
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المسمى (إنجليزي) *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: Software Developer"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المسمى (عربي)</label>
                <input
                  type="text"
                  [(ngModel)]="formData.title_ar"
                  name="title_ar"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="مثال: مطور برمجيات"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">العدد المطلوب</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.headcount"
                    name="headcount"
                    min="1"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">المستوى</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.level"
                    name="level"
                    min="1"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="2"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المسؤوليات</label>
                <textarea
                  [(ngModel)]="formData.responsibilities"
                  name="responsibilities"
                  rows="2"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">المتطلبات</label>
                <textarea
                  [(ngModel)]="formData.requirements"
                  name="requirements"
                  rows="2"
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
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
                    {{ editingPosition() ? 'حفظ التعديلات' : 'إضافة' }}
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
export class PositionListComponent implements OnInit {
  private api = inject(ApiService);

  positions = signal<Position[]>([]);
  departments = signal<Department[]>([]);
  loading = signal(true);
  showModal = signal(false);
  saving = signal(false);
  editingPosition = signal<Position | null>(null);
  selectedDepartment = '';

  formData: CreatePositionDto = {
    code: '',
    title: '',
    title_ar: '',
    department_id: undefined,
    headcount: 1,
    level: undefined,
    description: '',
    responsibilities: '',
    requirements: '',
    is_active: true,
  };

  ngOnInit() {
    this.loadDepartments();
    this.loadPositions();
  }

  loadDepartments() {
    this.api.getDepartments().subscribe({
      next: (depts) => this.departments.set(depts),
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  loadPositions() {
    this.loading.set(true);
    this.api.getPositions(this.selectedDepartment || undefined, true).subscribe({
      next: (positions) => {
        this.positions.set(positions);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading positions:', err);
        this.loading.set(false);
      }
    });
  }

  openModal() {
    this.editingPosition.set(null);
    this.formData = {
      code: '',
      title: '',
      title_ar: '',
      department_id: undefined,
      headcount: 1,
      level: undefined,
      description: '',
      responsibilities: '',
      requirements: '',
      is_active: true,
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingPosition.set(null);
  }

  editPosition(pos: Position) {
    this.editingPosition.set(pos);
    this.formData = {
      code: pos.code,
      title: pos.title,
      title_ar: pos.title_ar || '',
      department_id: pos.department_id || undefined,
      headcount: pos.headcount,
      level: pos.level || undefined,
      description: pos.description || '',
      responsibilities: pos.responsibilities || '',
      requirements: pos.requirements || '',
      is_active: pos.is_active,
    };
    this.showModal.set(true);
  }

  savePosition() {
    if (!this.formData.code || !this.formData.title) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    this.saving.set(true);
    
    const data = { ...this.formData };
    if (!data.department_id) {
      delete data.department_id;
    }

    const request = this.editingPosition()
      ? this.api.updatePosition(this.editingPosition()!.id, data)
      : this.api.createPosition(data);

    request.subscribe({
      next: () => {
        this.loadPositions();
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error saving position:', err);
        alert(err.error?.message || 'حدث خطأ أثناء الحفظ');
        this.saving.set(false);
      }
    });
  }

  deletePosition(pos: Position) {
    if (pos.current_count > 0) {
      alert('لا يمكن حذف مسمى وظيفي مرتبط بموظفين');
      return;
    }

    if (confirm(`هل أنت متأكد من حذف المسمى الوظيفي "${pos.title_ar || pos.title}"؟`)) {
      this.api.deletePosition(pos.id).subscribe({
        next: () => this.loadPositions(),
        error: (err) => {
          alert(err.error?.message || 'حدث خطأ أثناء الحذف');
        }
      });
    }
  }
}
