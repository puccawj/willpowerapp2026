import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { RoleService } from '../../core/services/role.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { FieldDef, Offering, OfferingStatus, SessionStatus } from '../../core/models/admin.models';

const STATUS_COLOR: Record<OfferingStatus, string> = {
  Draft: 'var(--w-muted)',
  Scheduled: 'var(--w-green)',
  Ongoing: 'var(--w-gold)',
  Completed: 'var(--w-ink-soft)',
  Cancelled: 'var(--w-red)',
};

const SESSION_STATUS: Record<SessionStatus, { color: string; label: string }> = {
  done: { color: 'var(--w-green)', label: 'Done' },
  today: { color: 'var(--w-accent)', label: 'Today' },
  upcoming: { color: 'var(--w-muted)', label: 'Upcoming' },
};

const FIELDS = (courseTitles: string[]): FieldDef[] => [
  { key: 'course', label: 'Course', type: 'select', options: courseTitles },
  { key: 'branch', label: 'Branch', type: 'select', options: ['USA', 'Canada', 'Australia'] },
  { key: 'instructor', label: 'Instructor', type: 'text' },
  { key: 'dates', label: 'Date range', type: 'text' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'mode', label: 'Mode', type: 'select', options: ['Onsite', 'Online'] },
  { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Scheduled', 'Ongoing', 'Completed', 'Cancelled'] },
];

@Component({
  selector: 'app-schedule',
  imports: [TableToolbar],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);
  private readonly router = inject(Router);
  readonly roleService = inject(RoleService);

  readonly statusColors = STATUS_COLOR;

  private readonly visibleOfferings = computed(() => {
    if (!this.roleService.isInstructor()) return this.data.offerings();
    return this.data.offerings().filter((o) => o.instructor === this.roleService.instructorName);
  });

  readonly ctrl = new ListController<Offering>(this.visibleOfferings);

  readonly sessions = computed(() =>
    this.data.sessions().map((s) => ({ ...s, ...SESSION_STATUS[s.status] })),
  );

  goEnrollment(): void {
    this.router.navigate(['/enrollment']);
  }

  addOffering(): void {
    this.modal.open({
      title: 'Add Class Offering',
      fields: FIELDS(this.data.courses().map((c) => c.title)),
      isEdit: false,
      values: {
        course: this.data.courses()[0]?.title ?? '',
        branch: 'USA',
        instructor: '',
        dates: '',
        capacity: 20,
        mode: 'Onsite',
        status: 'Draft',
      },
      onSave: (values) => {
        this.data.offerings.update((list) => [...list, { enrolled: 0, ...values } as Offering]);
      },
    });
  }

  editOffering(offering: Offering): void {
    this.modal.open({
      title: 'Edit Class Offering',
      fields: FIELDS(this.data.courses().map((c) => c.title)),
      isEdit: true,
      values: { ...offering },
      onSave: (values) => {
        this.data.offerings.update((list) => list.map((o) => (o === offering ? { ...o, ...values } as Offering : o)));
      },
      onDelete: () => {
        this.data.offerings.update((list) => list.filter((o) => o !== offering));
      },
    });
  }
}
