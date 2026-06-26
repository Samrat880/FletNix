import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastKind, ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2" aria-live="polite">
      @for (toast of toasts; track toast.id) {
        <div class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-panel backdrop-blur-xl transition" [ngClass]="toastClasses(toast.kind)">
          <p class="flex-1">{{ toast.message }}</p>
          <button type="button" (click)="dismiss(toast.id)" class="text-white/70 hover:text-white" aria-label="Dismiss">×</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  toasts: Toast[] = [];

  constructor() {
    this.toastService.stream$.subscribe((items) => {
      this.toasts = items;
    });
  }

  toastClasses(kind: ToastKind): string {
    if (kind === 'success') return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100';
    if (kind === 'error') return 'border-red-500/40 bg-red-500/15 text-red-100';
    return 'border-sky-500/40 bg-sky-500/15 text-sky-100';
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
