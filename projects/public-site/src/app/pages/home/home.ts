import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly data = inject(MockDataService);

  readonly homeEvents = this.data.events.filter((ev) => ev.when === 'upcoming').slice(0, 3);
  readonly homeCourses = this.data.courses.slice(0, 3);
}
