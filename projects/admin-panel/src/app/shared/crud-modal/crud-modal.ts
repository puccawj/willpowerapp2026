import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CrudModalService } from '../../core/services/crud-modal.service';

@Component({
  selector: 'app-crud-modal',
  imports: [FormsModule],
  templateUrl: './crud-modal.html',
  styleUrl: './crud-modal.scss',
})
export class CrudModal {
  readonly modal = inject(CrudModalService);

  onFieldChange(key: string, value: string): void {
    this.modal.setFieldValue(key, value);
  }

  onImageSelected(key: string, input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.modal.setFieldValue(key, String(reader.result));
    reader.readAsDataURL(file);
  }
}
