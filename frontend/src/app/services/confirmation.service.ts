import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
}

export interface ConfirmationResult {
  confirmed: boolean;
  value: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly request = signal<ConfirmationOptions | null>(null);
  private resolveCurrent: ((result: ConfirmationResult) => void) | null = null;

  confirm(options: ConfirmationOptions): Promise<ConfirmationResult> {
    if (this.resolveCurrent) this.resolveCurrent({ confirmed: false, value: '' });
    this.request.set(options);
    return new Promise((resolve) => { this.resolveCurrent = resolve; });
  }

  resolve(confirmed: boolean, value = ''): void {
    this.resolveCurrent?.({ confirmed, value: value.trim() });
    this.resolveCurrent = null;
    this.request.set(null);
  }
}
