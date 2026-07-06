import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { StudentDataService } from '../../../core/services/student-data.service';

@Component({
  selector: 'app-my-dashboard',
  imports: [RouterLink],
  templateUrl: './my-dashboard.html',
  styleUrl: './my-dashboard.scss',
})
export class MyDashboard {
  private readonly mock = inject(MockDataService);
  private readonly student = inject(StudentDataService);

  readonly upcomingRsvpCount = computed(
    () =>
      this.student
        .myRsvps()
        .filter((r) => r.status !== 'cancel' && this.mock.getEventById(r.eventId)?.when === 'upcoming').length,
  );

  readonly coursesInProgress = computed(
    () => this.student.myEnrollments.filter((e) => e.status === 'in-progress').length,
  );

  readonly certificatesEarned = computed(() => this.student.myCertificates.length);
  readonly donationsCount = computed(() => this.student.myDonations.length);

  readonly nextEvents = computed(() =>
    this.student
      .myRsvps()
      .filter((r) => r.status !== 'cancel')
      .map((r) => ({ rsvp: r, event: this.mock.getEventById(r.eventId) }))
      .filter((x) => x.event && x.event.when === 'upcoming')
      .slice(0, 3),
  );
}
