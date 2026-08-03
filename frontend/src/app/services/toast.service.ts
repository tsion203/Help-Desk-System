import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export interface ToastMessage { id: number; type: 'success' | 'error' | 'info'; message: string; }
interface ApiError { message?: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);
  private nextId = 0;

  success(message: string): void { this.show('success', message); }
  info(message: string): void { this.show('info', message); }
  error(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && (error as HttpErrorResponse & { handledByInterceptor?: boolean }).handledByInterceptor) return;
    this.show('error', this.getErrorMessage(error, fallback));
  }
  dismiss(id: number): void { this.messages.update((items) => items.filter((item) => item.id !== id)); }

  private show(type: ToastMessage['type'], message: string): void {
    const id = ++this.nextId;
    this.messages.update((items) => [...items, { id, type, message }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) return fallback;
    const apiError = error.error as ApiError | null;
    if (apiError && typeof apiError.message === 'string' && apiError.message.trim()) return apiError.message;
    return fallback;
  }
}
