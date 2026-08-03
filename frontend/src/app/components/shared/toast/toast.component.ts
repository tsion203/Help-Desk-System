import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="toast-stack" aria-live="polite"><div *ngFor="let toast of service.messages()" class="toast" [class.success]="toast.type === 'success'" [class.error]="toast.type === 'error'"><span>{{ toast.message }}</span><button type="button" (click)="service.dismiss(toast.id)" aria-label="Dismiss">×</button></div></div>`,
  styles: [`.toast-stack{position:fixed;top:20px;right:20px;z-index:1000;display:grid;gap:10px;width:min(380px,calc(100vw - 40px))}.toast{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border:1px solid;border-radius:10px;box-shadow:0 12px 32px #0003;animation:enter .2s ease-out}.toast.success{background:#e8f5e9;border-color:#81c784;color:#1b5e20}.toast.error{background:#fdecea;border-color:#ef9a9a;color:#b71c1c}.toast.info{background:#e8f1fb;border-color:#90b7df;color:#174a7e}.toast button{border:0;background:transparent;color:inherit;font-size:22px;cursor:pointer}@keyframes enter{from{opacity:0;transform:translateX(20px)}}`],
})
export class ToastComponent {
  readonly service = inject(ToastService);
}
