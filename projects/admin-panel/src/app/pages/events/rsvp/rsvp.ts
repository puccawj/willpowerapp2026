import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AdminDataService } from '../../../core/services/admin-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ListController } from '../../../core/list-controller';
import { TableToolbar } from '../../../shared/table-toolbar/table-toolbar';
import { Attendee, RsvpStatus } from '../../../core/models/admin.models';

interface AttendeeRow extends Attendee {
  checkedIn: boolean;
}

const RSVP_COLOR: Record<RsvpStatus, string> = {
  confirm: 'var(--w-green)',
  maybe: 'var(--w-gold)',
  cancel: 'var(--w-red)',
};

const RSVP_LABEL: Record<RsvpStatus, string> = {
  confirm: 'Confirmed',
  maybe: 'Maybe',
  cancel: 'Cancelled',
};

@Component({
  selector: 'app-rsvp',
  imports: [TableToolbar],
  templateUrl: './rsvp.html',
  styleUrl: './rsvp.scss',
})
export class Rsvp {
  private readonly data = inject(AdminDataService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly rsvpColor = RSVP_COLOR;
  readonly rsvpLabel = RSVP_LABEL;

  private readonly eventId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('id')))),
    { initialValue: NaN },
  );

  readonly event = computed(
    () => this.data.events().find((ev) => ev.id === this.eventId()) ?? this.data.events()[0],
  );

  private readonly attendeeRows = computed<AttendeeRow[]>(() => {
    const checkin = this.data.checkin();
    return this.data.attendees().map((a) => ({ ...a, checkedIn: !!checkin[a.id] }));
  });

  readonly ctrl = new ListController<AttendeeRow>(this.attendeeRows);

  toggleCheckin(a: AttendeeRow): void {
    this.data.checkin.update((map) => ({ ...map, [a.id]: !map[a.id] }));
  }

  goEvents(): void {
    this.router.navigate(['/events']);
  }

  // ---- Waitlist auto-logic ----

  simulateRsvp(): void {
    const ev = this.event();
    const full = ev.going >= ev.capacity;
    this.data.events.update((list) =>
      list.map((e) =>
        e.id === ev.id ? { ...e, going: full ? e.going : e.going + 1, waitlist: full ? e.waitlist + 1 : e.waitlist } : e,
      ),
    );
    this.toast.show(
      full
        ? `Event is at capacity — new RSVP was added to the waitlist automatically.`
        : `New RSVP confirmed (${ev.going + 1}/${ev.capacity}).`,
      full ? 'warning' : 'success',
    );
  }

  promoteFromWaitlist(): void {
    const ev = this.event();
    if (ev.waitlist <= 0 || ev.going >= ev.capacity) return;
    this.data.events.update((list) =>
      list.map((e) => (e.id === ev.id ? { ...e, going: e.going + 1, waitlist: e.waitlist - 1 } : e)),
    );
    this.toast.show('Next guest promoted from the waitlist to confirmed.', 'success');
  }

  // ---- QR check-in ----

  readonly qrOpen = signal(false);
  readonly qrSearch = signal('');

  readonly qrResults = computed(() => {
    const term = this.qrSearch().trim().toLowerCase();
    const rows = this.attendeeRows();
    if (!term) return rows;
    return rows.filter((a) => a.name.toLowerCase().includes(term));
  });

  openQrScanner(): void {
    this.qrSearch.set('');
    this.qrOpen.set(true);
  }

  closeQrScanner(): void {
    this.qrOpen.set(false);
  }

  checkInFromScanner(a: AttendeeRow): void {
    this.data.checkin.update((map) => ({ ...map, [a.id]: true }));
    this.toast.show(`${a.name} checked in via QR scan.`, 'success');
  }
}
