import { Injectable, signal } from '@angular/core';
import { MyCertificate, MyDonation, MyEnrollment, MyEventRsvp, MyRsvpStatus } from '../models/student.models';

@Injectable({ providedIn: 'root' })
export class StudentDataService {
  readonly myRsvps = signal<MyEventRsvp[]>([
    { eventId: 1, status: 'confirm', checkedIn: false },
    { eventId: 2, status: 'maybe', checkedIn: false },
    { eventId: 6, status: 'confirm', checkedIn: true },
  ]);

  setRsvpStatus(eventId: number, status: MyRsvpStatus): void {
    this.myRsvps.update((list) => list.map((r) => (r.eventId === eventId ? { ...r, status } : r)));
  }

  readonly myEnrollments: MyEnrollment[] = [
    {
      courseTitle: 'The Path of Willpower',
      level: 'Intermediate',
      branch: 'USA',
      sessionsTotal: 12,
      sessionsAttended: 10,
      attendancePct: 83,
      passPct: 80,
      status: 'in-progress',
    },
    {
      courseTitle: 'Introduction to Meditation',
      level: 'Foundations',
      branch: 'USA',
      sessionsTotal: 8,
      sessionsAttended: 8,
      attendancePct: 100,
      passPct: 80,
      status: 'completed',
    },
  ];

  readonly myCertificates: MyCertificate[] = [
    { id: 'cert1', courseTitle: 'Introduction to Meditation', issuedDate: 'Jul 20, 2026', certNo: 'WPI-US-CERT-0512' },
  ];

  readonly myDonations: MyDonation[] = [
    { id: 'dn1', date: 'Jun 3, 2026', type: 'Money', amountLabel: '$250.00', event: 'Morning Meditation Retreat', certNo: 'WPI-US-2026-0182' },
    { id: 'dn2', date: 'Mar 12, 2026', type: 'Goods', amountLabel: '10 kg rice', event: "Founders' Day Ceremony", certNo: 'WPI-AU-2026-0044' },
  ];
}
