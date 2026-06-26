import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastKind = 'success' | 'info' | 'error';

export interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  private readonly toasts$ = new BehaviorSubject<Toast[]>([]);

  readonly stream$ = this.toasts$.asObservable();

  show(message: string, kind: ToastKind = 'info', durationMs = 3200): void {
    const id = ++this.seq;
    const toast: Toast = { id, message, kind };
    this.toasts$.next([...this.toasts$.value, toast]);

    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  error(message: string): void {
    this.show(message, 'error', 4500);
  }

  dismiss(id: number): void {
    this.toasts$.next(this.toasts$.value.filter((t) => t.id !== id));
  }
}
