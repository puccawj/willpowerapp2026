import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { CertTemplate, FieldDef } from '../../core/models/admin.models';

interface TemplateRow extends CertTemplate {
  active: boolean;
  statusLabel: string;
  statusColor: string;
  toggleLabel: string;
  toggleColor: string;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Template name', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: ['Certificate', 'Donation (Money)', 'Donation (Goods)'] },
  { key: 'year', label: 'Year', type: 'text' },
  { key: 'background', label: 'Upload background', type: 'image' },
];

@Component({
  selector: 'app-templates',
  imports: [],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);

  readonly recipientName = 'Jane Q. Student';
  readonly courseTitle = 'The Path of Willpower';
  readonly certificateNo = 'WPI-US-CERT-0512';
  readonly issueDate = 'Jul 20, 2026';

  readonly rows = computed<TemplateRow[]>(() => {
    const statusMap = this.data.templateStatus();
    return this.data.templates().map((t) => {
      const active = !!statusMap[t.id];
      return {
        ...t,
        active,
        statusLabel: active ? 'Active' : 'Archived',
        statusColor: active ? 'var(--w-green)' : 'var(--w-muted)',
        toggleLabel: active ? 'Archive' : 'Set active',
        toggleColor: active ? 'var(--w-red)' : 'var(--w-green)',
      };
    });
  });

  toggleStatus(row: TemplateRow): void {
    this.data.templateStatus.update((m) => ({ ...m, [row.id]: !m[row.id] }));
  }

  addTemplate(): void {
    this.modal.open({
      title: 'Add Certificate Template',
      fields: FIELDS,
      isEdit: false,
      values: { name: '', type: 'Certificate', year: '2026' },
      onSave: (values) => {
        this.data.templates.update((list) => [
          ...list,
          { id: 't' + (list.length + 1), bg: 'linear-gradient(135deg,#c6a24a,#8a5a2e)', sampleNo: '', ...values } as CertTemplate,
        ]);
      },
    });
  }

  editTemplate(row: TemplateRow): void {
    this.modal.open({
      title: 'Edit Certificate Template',
      fields: FIELDS,
      isEdit: true,
      values: { name: row.name, type: row.type, year: row.year },
      onSave: (values) => {
        this.data.templates.update((list) => list.map((t) => (t.id === row.id ? { ...t, ...values } as CertTemplate : t)));
      },
      onDelete: () => {
        this.data.templates.update((list) => list.filter((t) => t.id !== row.id));
      },
    });
  }
}
