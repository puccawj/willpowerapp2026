import { Component, computed, inject, signal } from '@angular/core';
import { AdminDataService, avatarColorFor, initialsOf } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { ExcelService } from '../../core/services/excel.service';
import { ToastService } from '../../core/services/toast.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { FilterTabs, FilterOption } from '../../shared/filter-tabs/filter-tabs';
import { AdminUser, FieldDef, UserRole, UserStatus } from '../../core/models/admin.models';

interface UserRow extends AdminUser {
  initials: string;
  avatarColor: string;
  statusKey: UserStatus;
  statusLabel: string;
  statusColor: string;
  actionLabel: string;
  actionColor: string;
}

const STATUS_COLOR: Record<UserStatus, string> = {
  active: 'var(--w-green)',
  suspended: 'var(--w-red)',
  pending: 'var(--w-gold)',
};

const STATUS_LABEL: Record<UserStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending',
};

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Full name', type: 'text' },
  { key: 'role', label: 'Role', type: 'select', options: ['Student', 'Instructor', 'Admin'] },
  { key: 'branch', label: 'Branch', type: 'select', options: ['USA', 'Canada', 'Australia'] },
  { key: 'email', label: 'Email', type: 'text' },
];

@Component({
  selector: 'app-users',
  imports: [TableToolbar, FilterTabs],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);
  private readonly excel = inject(ExcelService);
  private readonly toast = inject(ToastService);

  readonly filter = signal('all');

  readonly filterOptions: FilterOption[] = [
    { key: 'all', label: 'All' },
    { key: 'Student', label: 'Students' },
    { key: 'Instructor', label: 'Instructors' },
    { key: 'Admin', label: 'Admins' },
  ];

  private readonly rows = computed<UserRow[]>(() => {
    const statusMap = this.data.userStatus();
    return this.data.users().map((u) => {
      const status = statusMap[u.id] ?? 'active';
      return {
        ...u,
        initials: initialsOf(u.name),
        avatarColor: avatarColorFor(u.name),
        statusKey: status,
        statusLabel: STATUS_LABEL[status],
        statusColor: STATUS_COLOR[status],
        actionLabel: status === 'suspended' ? 'Reactivate' : 'Suspend',
        actionColor: status === 'suspended' ? 'var(--w-green)' : 'var(--w-red)',
      };
    });
  });

  private readonly filteredRows = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.rows() : this.rows().filter((u) => u.role === f);
  });

  readonly ctrl = new ListController<UserRow>(this.filteredRows);

  setFilter = (key: string) => this.filter.set(key);

  toggleStatus(row: UserRow): void {
    this.data.userStatus.update((m) => ({
      ...m,
      [row.id]: (m[row.id] ?? 'active') === 'suspended' ? 'active' : 'suspended',
    }));
  }

  addUser(): void {
    this.modal.open({
      title: 'Add User',
      fields: FIELDS,
      isEdit: false,
      values: { name: '', role: 'Student', branch: 'USA', email: '' },
      onSave: (values) => {
        this.data.users.update((list) => [...list, { id: 'u' + (list.length + 1), ...values } as AdminUser]);
      },
    });
  }

  private cell(row: Record<string, string>, ...keys: string[]): string {
    for (const key of Object.keys(row)) {
      if (keys.some((k) => k.toLowerCase() === key.toLowerCase())) return String(row[key]).trim();
    }
    return '';
  }

  async importFromFile(file: File): Promise<void> {
    let rows: Record<string, string>[];
    try {
      rows = await this.excel.parseFile(file);
    } catch {
      this.toast.show('Could not read that file — expected an .xlsx or .csv export.', 'error');
      return;
    }

    const validRoles: UserRole[] = ['Student', 'Instructor', 'Admin'];
    const validBranches = ['USA', 'Canada', 'Australia'];
    let imported = 0;
    const newUsers: AdminUser[] = [];
    const startId = this.data.users().length;

    rows.forEach((r, i) => {
      const name = this.cell(r, 'name', 'full name');
      const email = this.cell(r, 'email');
      if (!name || !email) return;
      const role = (validRoles.find((v) => v === this.cell(r, 'role')) ?? 'Student') as UserRole;
      const branch = (validBranches.find((v) => v === this.cell(r, 'branch')) ?? 'USA') as AdminUser['branch'];
      newUsers.push({ id: `u_import_${startId + i}`, name, email, role, branch });
      imported++;
    });

    if (imported === 0) {
      this.toast.show('No valid rows found — make sure the file has "name" and "email" columns.', 'warning');
      return;
    }

    this.data.users.update((list) => [...list, ...newUsers]);
    this.toast.show(`Imported ${imported} user${imported === 1 ? '' : 's'} from ${file.name}.`, 'success');
  }

  editUser(row: UserRow): void {
    this.modal.open({
      title: 'Edit User',
      fields: FIELDS,
      isEdit: true,
      values: { name: row.name, role: row.role, branch: row.branch, email: row.email },
      onSave: (values) => {
        this.data.users.update((list) => list.map((u) => (u.id === row.id ? { ...u, ...values } as AdminUser : u)));
      },
      onDelete: () => {
        this.data.users.update((list) => list.filter((u) => u.id !== row.id));
      },
    });
  }
}
