import { Component, inject } from '@angular/core';
import { StudentDataService } from '../../../core/services/student-data.service';

@Component({
  selector: 'app-my-donations',
  imports: [],
  templateUrl: './my-donations.html',
  styleUrl: './my-donations.scss',
})
export class MyDonations {
  private readonly student = inject(StudentDataService);
  readonly donations = this.student.myDonations;
}
