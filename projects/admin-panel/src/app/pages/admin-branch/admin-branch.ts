import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { AuditLogService } from '../../core/services/audit-log.service';
import { RoleService } from '../../core/services/role.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';

interface Chip {
  key: string;
  label: string;
  on: boolean;
}

interface AdminAssignment {
  id: string;
  name: string;
  email: string;
  chips: Chip[];
  primary: string;
}

const BRANCH_KEYS: { key: string; label: string }[] = [
  { key: 'usa', label: 'USA' },
  { key: 'canada', label: 'Canada' },
  { key: 'australia', label: 'Australia' },
];

@Component({
  selector: 'app-admin-branch',
  imports: [TableToolbar],
  templateUrl: './admin-branch.html',
  styleUrl: './admin-branch.scss',
})
export class AdminBranch {
  private readonly data = inject(AdminDataService);
  private readonly roleService = inject(RoleService);
  readonly auditLog = inject(AuditLogService);

  private readonly rows = computed<AdminAssignment[]>(() => {
    const access = this.data.adminAccess();
    return Object.keys(access).map((aid) => {
      const [name, email] = this.data.adminNames[aid];
      const branchAccess = access[aid];
      const chips = BRANCH_KEYS.map((bk) => ({ key: bk.key, label: bk.label, on: !!branchAccess[bk.key] }));
      const primary = BRANCH_KEYS.filter((bk) => branchAccess[bk.key]).map((bk) => bk.label)[0] ?? '—';
      return { id: aid, name, email, chips, primary };
    });
  });

  readonly ctrl = new ListController<AdminAssignment>(this.rows);

  toggleChip(row: AdminAssignment, chip: Chip): void {
    const granting = !chip.on;
    this.data.adminAccess.update((access) => ({
      ...access,
      [row.id]: { ...access[row.id], [chip.key]: granting },
    }));
    this.auditLog.record(
      `${this.roleService.role() === 'superadmin' ? 'Superadmin' : 'Admin'} (you)`,
      `${granting ? 'Granted' : 'Revoked'} ${chip.label} access ${granting ? 'to' : 'from'} ${row.name}`,
    );
  }

  timeAgo(date: Date): string {
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    return `${hours}h ago`;
  }
}
