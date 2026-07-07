import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataService } from '../../../core/services/admin-data.service';
import { CrudModalService } from '../../../core/services/crud-modal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ListController } from '../../../core/list-controller';
import { formatDateFull, formatDateShort, parseDisplayDateTime, toDateTimeLocalValue } from '../../../core/date-time.util';
import { TableToolbar } from '../../../shared/table-toolbar/table-toolbar';
import { FilterTabs, FilterOption } from '../../../shared/filter-tabs/filter-tabs';
import { AdminEvent, EventStatus, FieldDef } from '../../../core/models/admin.models';

const STATUS_COLORS: Record<EventStatus, string> = {
  Draft: 'var(--w-muted)',
  Scheduled: 'var(--w-green)',
  Published: 'var(--w-accent)',
  Ongoing: 'var(--w-gold)',
  Closed: 'var(--w-ink-soft)',
  Cancelled: 'var(--w-red)',
};

const FIELDS: FieldDef[] = [
  { key: 'title', label: 'Event title', type: 'text' },
  { key: 'branch', label: 'Branch', type: 'select', options: ['USA', 'Canada', 'Australia'] },
  { key: 'location', label: 'Location', type: 'text' },
  { key: 'dateTime', label: 'Date & time', type: 'datetime' },
  { key: 'capacity', label: 'Capacity', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Scheduled', 'Published', 'Ongoing', 'Closed', 'Cancelled'] },
  { key: 'cover', label: 'Cover image', type: 'image' },
];

/** Replaces the picker's transient `dateTime` value with the derived `dateFull` / `dateShort` display strings. */
function deriveDateFields(values: Record<string, string | number>): Record<string, string | number> {
  const { dateTime, ...rest } = values;
  const date = new Date(String(dateTime));
  if (Number.isNaN(date.getTime())) return rest;
  return { ...rest, dateFull: formatDateFull(date), dateShort: formatDateShort(date) };
}

@Component({
  selector: 'app-event-list',
  imports: [TableToolbar, FilterTabs],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly statusColors = STATUS_COLORS;
  readonly filter = signal('all');

  readonly filterOptions: FilterOption[] = [
    { key: 'all', label: 'All' },
    { key: 'Published', label: 'Published' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'Draft', label: 'Draft' },
  ];

  private readonly filteredEvents = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.data.events() : this.data.events().filter((ev) => ev.status === f);
  });

  readonly ctrl = new ListController<AdminEvent>(this.filteredEvents);

  setFilter = (key: string) => this.filter.set(key);

  rsvpSummary(ev: AdminEvent): string {
    return `${ev.going}✓ ${ev.maybe}? ${ev.cancel}✕`;
  }

  openRsvp(ev: AdminEvent): void {
    this.router.navigate(['/rsvp', ev.id]);
  }

  addEvent(): void {
    this.modal.open({
      title: 'Add Event',
      fields: FIELDS,
      isEdit: false,
      values: {
        title: '',
        branch: 'USA',
        location: '',
        dateTime: toDateTimeLocalValue(new Date()),
        capacity: 20,
        status: 'Draft',
      },
      onSave: (values) => {
        this.data.events.update((list) => [
          ...list,
          {
            id: Math.max(0, ...list.map((e) => e.id)) + 1,
            going: 0,
            maybe: 0,
            cancel: 0,
            waitlist: 0,
            ...deriveDateFields(values),
          } as AdminEvent,
        ]);
      },
    });
  }

  editEvent(ev: AdminEvent): void {
    const registeredCount = ev.going + ev.maybe;
    this.modal.open({
      title: 'Edit Event',
      fields: FIELDS,
      isEdit: true,
      values: { ...ev, dateTime: toDateTimeLocalValue(parseDisplayDateTime(ev.dateFull)) },
      onSave: (values) => {
        const derived = deriveDateFields(values);
        this.data.events.update((list) => list.map((e) => (e.id === ev.id ? { ...e, ...derived } as AdminEvent : e)));
        if (derived['status'] === 'Cancelled' && ev.status !== 'Cancelled') {
          this.notifications.add(
            `"${ev.title}" was cancelled — ${registeredCount} registered guest${registeredCount === 1 ? '' : 's'} notified by email (simulated).`,
          );
        } else {
          this.notifications.add(
            `"${ev.title}" was updated — ${registeredCount} registered guest${registeredCount === 1 ? '' : 's'} notified of the changes (simulated).`,
          );
        }
      },
      onDelete: () => {
        this.data.events.update((list) => list.filter((e) => e.id !== ev.id));
        this.notifications.add(
          `"${ev.title}" was deleted — ${registeredCount} registered guest${registeredCount === 1 ? '' : 's'} notified (simulated).`,
        );
      },
    });
  }
}
