import { Component, computed, inject } from '@angular/core';
import { AdminDataService, avatarColorFor, initialsOf } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { FieldDef, TeamMember } from '../../core/models/admin.models';

interface TeamRow extends TeamMember {
  initials: string;
  avatarColor: string;
}

const FIELDS: FieldDef[] = [
  { key: 'name', label: 'Full name', type: 'text' },
  { key: 'role', label: 'Role/title', type: 'text' },
  { key: 'branch', label: 'Branch', type: 'select', options: ['USA', 'Canada', 'Australia'] },
  { key: 'shown', label: 'Shown on site', type: 'select', options: ['Yes', 'No'] },
  { key: 'photo', label: 'Photo', type: 'image' },
];

@Component({
  selector: 'app-team',
  imports: [TableToolbar],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);

  private readonly rows = computed<TeamRow[]>(() =>
    this.data.team().map((m) => ({ ...m, initials: initialsOf(m.name), avatarColor: avatarColorFor(m.name) })),
  );

  readonly ctrl = new ListController<TeamRow>(this.rows);

  addMember(): void {
    this.modal.open({
      title: 'Add Team Member',
      fields: FIELDS,
      isEdit: false,
      values: { name: '', role: '', branch: 'USA', shown: 'Yes' },
      onSave: (values) => {
        this.data.team.update((list) => [...list, values as unknown as TeamMember]);
      },
    });
  }

  editMember(row: TeamRow): void {
    this.modal.open({
      title: 'Edit Team Member',
      fields: FIELDS,
      isEdit: true,
      values: { name: row.name, role: row.role, branch: row.branch, shown: row.shown },
      onSave: (values) => {
        this.data.team.update((list) =>
          list.map((m) => (m.name === row.name ? ({ ...m, ...values } as TeamMember) : m)),
        );
      },
      onDelete: () => {
        this.data.team.update((list) => list.filter((m) => m.name !== row.name));
      },
    });
  }
}
