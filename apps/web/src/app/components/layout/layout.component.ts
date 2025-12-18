import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100" dir="rtl">
      <!-- Sidebar -->
      <aside class="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-30">
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="flex items-center justify-center h-16 border-b">
            <h1 class="text-xl font-bold text-blue-600">نظام الموارد البشرية</h1>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 overflow-y-auto p-4">
            <ul class="space-y-2">
              <li>
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  <span>لوحة التحكم</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/employees"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>الموظفين</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/departments"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span>الأقسام</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/positions"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>المسميات الوظيفية</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/salary-grades"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>سلم الرواتب</span>
                </a>
              </li>

              <!-- Divider -->
              <li class="pt-4 mt-4 border-t">
                <span class="text-xs font-semibold text-gray-400 uppercase px-4">الرواتب والمستحقات</span>
              </li>

              <li>
                <a
                  routerLink="/payroll"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span>مسير الرواتب</span>
                </a>
              </li>
              <li>
                <a
                  routerLink="/loans"
                  routerLinkActive="bg-blue-50 text-blue-600"
                  class="flex items-center gap-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>السلف والقروض</span>
                </a>
              </li>
            </ul>
          </nav>

          <!-- Footer -->
          <div class="p-4 border-t">
            <div class="text-xs text-gray-500 text-center">
              نظام الموارد البشرية v1.0
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="mr-64">
        <!-- Top Bar -->
        <header class="bg-white shadow-sm h-16 flex items-center px-6">
          <div class="flex-1">
            <h2 class="text-lg font-semibold text-gray-800">مرحباً بك في نظام الموارد البشرية</h2>
          </div>
        </header>

        <!-- Page Content -->
        <div class="p-6">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LayoutComponent {}
