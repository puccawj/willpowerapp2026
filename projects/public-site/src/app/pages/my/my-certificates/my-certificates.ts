import { Component, inject } from '@angular/core';
import { StudentDataService } from '../../../core/services/student-data.service';

@Component({
  selector: 'app-my-certificates',
  imports: [],
  templateUrl: './my-certificates.html',
  styleUrl: './my-certificates.scss',
})
export class MyCertificates {
  private readonly student = inject(StudentDataService);
  readonly certificates = this.student.myCertificates;
}
