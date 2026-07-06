import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { StudentDataService } from '../../../core/services/student-data.service';
import { MyRsvpStatus } from '../../../core/models/student.models';

@Component({
  selector: 'app-my-events',
  imports: [RouterLink],
  templateUrl: './my-events.html',
  styleUrl: './my-events.scss',
})
export class MyEvents {
  private readonly mock = inject(MockDataService);
  readonly student = inject(StudentDataService);

  readonly rows = computed(() =>
    this.student
      .myRsvps()
      .map((r) => ({ rsvp: r, event: this.mock.getEventById(r.eventId) }))
      .filter((x) => x.event),
  );

  cancel(eventId: number): void {
    this.student.setRsvpStatus(eventId, 'cancel' as MyRsvpStatus);
  }
}
