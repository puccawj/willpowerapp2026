import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { BranchInfo, FieldDef } from '../../core/models/admin.models';

interface BranchRow extends BranchInfo {
  active: boolean;
  statusLabel: string;
  statusColor: string;
  toggleLabel: string;
  toggleColor: string;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Branch name', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'logo', label: 'Branch photo', type: 'image' },
];

@Component({
  selector: 'app-branches',
  imports: [TableToolbar],
  templateUrl: './branches.html',
  styleUrl: './branches.scss',
})
export class Branches {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);

  private readonly rows = computed<BranchRow[]>(() => {
    const statusMap = this.data.branchStatus();
    return this.data.branches().map((b) => {
      const active = statusMap[b.key] !== false;
      return {
        ...b,
        active,
        statusLabel: active ? 'Active' : 'Inactive',
        statusColor: active ? 'var(--w-green)' : 'var(--w-muted)',
        toggleLabel: active ? 'Deactivate' : 'Activate',
        toggleColor: active ? 'var(--w-red)' : 'var(--w-green)',
      };
    });
  });

  readonly ctrl = new ListController<BranchRow>(this.rows, 'card');

  toggleStatus(row: BranchRow): void {
    this.data.branchStatus.update((m) => ({ ...m, [row.key]: !(m[row.key] !== false) }));
  }

  addBranch(): void {
    this.modal.open({
      title: 'Add Branch',
      fields: FIELDS,
      isEdit: false,
      values: { name: '', city: '' },
      onSave: (values) => {
        this.data.branches.update((list) => [
          ...list,
          { key: 'branch_' + Date.now(), adminCount: 0, userCount: 0, eventCount: 0, ...values } as BranchInfo,
        ]);
      },
    });
  }

  editBranch(row: BranchRow): void {
    this.modal.open({
      title: 'Edit Branch',
      fields: FIELDS,
      isEdit: true,
      values: { name: row.name, city: row.city },
      onSave: (values) => {
        this.data.branches.update((list) => list.map((b) => (b.key === row.key ? { ...b, ...values } as BranchInfo : b)));
      },
      onDelete: () => {
        this.data.branches.update((list) => list.filter((b) => b.key !== row.key));
      },
    });
  }
}
