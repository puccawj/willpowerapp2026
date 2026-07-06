import { Injectable, signal } from '@angular/core';
import { FieldDef } from '../models/admin.models';

export interface CrudModalConfig {
  title: string;
  fields: FieldDef[];
  values: Record<string, string | number>;
  isEdit: boolean;
  onSave: (values: Record<string, string | number>) => void;
  onDelete?: () => void;
}

@Injectable({ providedIn: 'root' })
export class CrudModalService {
  readonly config = signal<CrudModalConfig | null>(null);

  open(config: CrudModalConfig): void {
    this.config.set(config);
  }

  close(): void {
    this.config.set(null);
  }

  setFieldValue(key: string, value: string | number): void {
    const current = this.config();
    if (!current) return;
    this.config.set({ ...current, values: { ...current.values, [key]: value } });
  }

  save(): void {
    const current = this.config();
    if (!current) return;
    const values = { ...current.values };
    current.fields
      .filter((f) => f.type === 'number')
      .forEach((f) => {
        values[f.key] = Number(values[f.key]) || 0;
      });
    current.onSave(values);
    this.close();
  }

  delete(): void {
    const current = this.config();
    if (!current?.onDelete) {
      this.close();
      return;
    }
    current.onDelete();
    this.close();
  }
}
