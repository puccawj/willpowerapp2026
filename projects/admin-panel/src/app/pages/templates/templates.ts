import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { ToastService } from '../../core/services/toast.service';
import { CertTemplate, FieldDef, FieldPosition } from '../../core/models/admin.models';

interface TemplateRow extends CertTemplate {
  active: boolean;
  statusLabel: string;
  statusColor: string;
  toggleLabel: string;
  toggleColor: string;
}

type DesignerFieldKey = 'kicker' | 'name' | 'course' | 'certNo' | 'issueDate';

const DEFAULT_POSITIONS: Record<DesignerFieldKey, FieldPosition> = {
  kicker: { xPct: 50, yPct: 22 },
  name: { xPct: 50, yPct: 44 },
  course: { xPct: 50, yPct: 62 },
  certNo: { xPct: 12, yPct: 90 },
  issueDate: { xPct: 88, yPct: 90 },
};

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
  private readonly toast = inject(ToastService);

  readonly recipientName = 'Jane Q. Student';
  readonly courseTitle = 'The Path of Willpower';
  readonly certificateNo = 'WPI-US-CERT-0512';
  readonly issueDate = 'Jul 20, 2026';

  readonly designerFields: { key: DesignerFieldKey; label: string }[] = [
    { key: 'kicker', label: 'CERTIFICATE OF COMPLETION' },
    { key: 'name', label: this.recipientName },
    { key: 'course', label: this.courseTitle },
    { key: 'certNo', label: this.certificateNo },
    { key: 'issueDate', label: this.issueDate },
  ];

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

  readonly selectedTemplateId = signal<string | null>(null);

  readonly selectedTemplate = computed(() => {
    const rows = this.rows();
    return rows.find((r) => r.id === this.selectedTemplateId()) ?? rows[0] ?? null;
  });

  positionOf(key: DesignerFieldKey): FieldPosition {
    return this.selectedTemplate()?.fieldPositions?.[key] ?? DEFAULT_POSITIONS[key];
  }

  selectForDesign(row: TemplateRow): void {
    this.selectedTemplateId.set(row.id);
  }

  toggleStatus(row: TemplateRow): void {
    this.data.templateStatus.update((m) => ({ ...m, [row.id]: !m[row.id] }));
  }

  addTemplate(): void {
    this.modal.open({
      title: 'Add Certificate Template',
      fields: FIELDS,
      isEdit: false,
      values: { name: '', type: 'Certificate', year: '2026', background: '' },
      onSave: (values) => {
        const { background, ...rest } = values as Record<string, string>;
        const id = 't' + Date.now();
        this.data.templates.update((list) => [
          ...list,
          {
            id,
            bg: 'linear-gradient(135deg,#c6a24a,#8a5a2e)',
            bgImage: background || undefined,
            sampleNo: '',
            ...rest,
          } as CertTemplate,
        ]);
        this.selectedTemplateId.set(id);
        this.toast.show(`Template "${rest['name']}" created${background ? ' with uploaded background' : ''}.`, 'success');
      },
    });
  }

  editTemplate(row: TemplateRow): void {
    this.modal.open({
      title: 'Edit Certificate Template',
      fields: FIELDS,
      isEdit: true,
      values: { name: row.name, type: row.type, year: row.year, background: row.bgImage ?? '' },
      onSave: (values) => {
        const { background, ...rest } = values as Record<string, string>;
        this.data.templates.update((list) =>
          list.map((t) => (t.id === row.id ? { ...t, ...rest, bgImage: background || t.bgImage } as CertTemplate : t)),
        );
        this.toast.show(`Template "${rest['name']}" updated.`, 'success');
      },
      onDelete: () => {
        this.data.templates.update((list) => list.filter((t) => t.id !== row.id));
      },
    });
  }

  // ---- Draggable designer ----

  private readonly canvasRef = viewChild<ElementRef<HTMLDivElement>>('designerCanvas');
  private draggingKey: DesignerFieldKey | null = null;

  startDrag(key: DesignerFieldKey, event: PointerEvent): void {
    event.preventDefault();
    this.draggingKey = key;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onCanvasPointerMove(event: PointerEvent): void {
    if (!this.draggingKey) return;
    const canvas = this.canvasRef()?.nativeElement;
    const template = this.selectedTemplate();
    if (!canvas || !template) return;

    const rect = canvas.getBoundingClientRect();
    const xPct = Math.min(96, Math.max(4, ((event.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.min(96, Math.max(4, ((event.clientY - rect.top) / rect.height) * 100));

    const key = this.draggingKey;
    this.data.templates.update((list) =>
      list.map((t) =>
        t.id === template.id
          ? {
              ...t,
              fieldPositions: {
                ...DEFAULT_POSITIONS,
                ...t.fieldPositions,
                [key]: { xPct, yPct },
              },
            }
          : t,
      ),
    );
  }

  endDrag(): void {
    this.draggingKey = null;
  }
}
