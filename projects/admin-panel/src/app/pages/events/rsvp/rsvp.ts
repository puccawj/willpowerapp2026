import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { AdminDataService } from '../../../core/services/admin-data.service';
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
}
