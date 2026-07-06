export interface StudentUser {
  name: string;
  email: string;
  initials: string;
}

export type MyRsvpStatus = 'confirm' | 'maybe' | 'cancel';

export interface MyEventRsvp {
  eventId: number;
  status: MyRsvpStatus;
  checkedIn: boolean;
}

export interface MyEnrollment {
  courseTitle: string;
  level: string;
  branch: string;
  sessionsTotal: number;
  sessionsAttended: number;
  attendancePct: number;
  passPct: number;
  status: 'in-progress' | 'completed' | 'failed';
}

export interface MyCertificate {
  id: string;
  courseTitle: string;
  issuedDate: string;
  certNo: string;
}

export interface MyDonation {
  id: string;
  date: string;
  type: 'Money' | 'Goods';
  amountLabel: string;
  event: string;
  certNo: string | null;
}
