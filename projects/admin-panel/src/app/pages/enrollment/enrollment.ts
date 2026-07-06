import { Component, computed, inject } from '@angular/core';
import { AdminDataService, avatarColorFor, initialsOf } from '../../core/services/admin-data.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { Enrollment as EnrollmentModel } from '../../core/models/admin.models';

interface EnrollmentRow extends EnrollmentModel {
  initials: string;
  avatarColor: string;
  pctLabel: string;
  pctColor: string;
  present: boolean;
  presentLabel: string;
  presentColor: string;
  actionLabel: string;
}

@Component({
  selector: 'app-enrollment',
  imports: [TableToolbar],
  templateUrl: './enrollment.html',
  styleUrl: './enrollment.scss',
})
export class Enrollment {
  private readonly data = inject(AdminDataService);

  private readonly rows = computed<EnrollmentRow[]>(() => {
    const attendance = this.data.sessionAttendance();
    return this.data.enrollments().map((e) => {
      const present = !!attendance[e.id];
      return {
        ...e,
        initials: initialsOf(e.name),
        avatarColor: avatarColorFor(e.name),
        pctLabel: e.pct + '%',
        pctColor: e.pct >= 80 ? 'var(--w-green)' : e.pct >= 60 ? 'var(--w-gold)' : 'var(--w-red)',
        present,
        presentLabel: present ? 'Present' : 'Absent',
        presentColor: present ? 'var(--w-green)' : 'var(--w-red)',
        actionLabel: present ? 'Mark absent' : 'Mark present',
      };
    });
  });

  readonly ctrl = new ListController<EnrollmentRow>(this.rows);

  toggle(row: EnrollmentRow): void {
    this.data.sessionAttendance.update((m) => ({ ...m, [row.id]: !m[row.id] }));
  }
}
