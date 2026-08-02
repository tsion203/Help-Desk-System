import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ToastMessage { id: number; type: 'success' | 'error'; message: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(message: string): void { this.show('success', message); }
  error(error: unknown, fallback: string): void { this.show('error', this.getErrorMessage(error, fallback)); }
  dismiss(id: number): void { this.messages.update((items) => items.filter((item) => item.id !== id)); }

  private show(type: 'success' | 'error', message: string): void {
    const id = ++this.nextId;
    this.messages.update((items) => [...items, { id, type, message }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    if (typeof error.error === 'string' && error.error.trim()) return error.error;
    if (error.error && typeof error.error.message === 'string') return error.error.message;
    if (error.error && typeof error.error === 'object') {
      const details = Object.values(error.error).filter((value) => typeof value === 'string').join(', ');
      if (details) return details;
    }
    return error.message || fallback;
  }
}
