import { Component, inject } from '@angular/core';
import { StudentDataService } from '../../../core/services/student-data.service';

@Component({
  selector: 'app-my-courses',
  imports: [],
  templateUrl: './my-courses.html',
  styleUrl: './my-courses.scss',
})
export class MyCourses {
  private readonly student = inject(StudentDataService);
  readonly enrollments = this.student.myEnrollments;
}
