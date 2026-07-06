import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
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
    this.data.adminAccess.update((access) => ({
      ...access,
      [row.id]: { ...access[row.id], [chip.key]: !access[row.id][chip.key] },
    }));
  }
}
