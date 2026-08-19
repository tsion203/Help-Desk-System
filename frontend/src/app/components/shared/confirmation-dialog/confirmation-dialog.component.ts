import { Component, ElementRef, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService } from '../../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  @ViewChild('dialog') dialog?: ElementRef<HTMLDialogElement>;
  readonly input = new FormControl('', { nonNullable: true });

  constructor(readonly confirmation: ConfirmationService) {
    effect(() => {
      const request = this.confirmation.request();
      this.input.setValue('');
      this.input.setValidators(request?.inputRequired ? [Validators.required] : []);
      this.input.updateValueAndValidity();
      queueMicrotask(() => {
        const element = this.dialog?.nativeElement;
        if (request && element && !element.open) element.showModal();
        if (!request && element?.open) element.close();
      });
    });
  }

  cancel(): void { this.confirmation.resolve(false); }
  confirm(): void {
    if (this.confirmation.request()?.inputRequired && this.input.invalid) {
      this.input.markAsTouched();
      return;
    }
    this.confirmation.resolve(true, this.input.value);
  }
}
