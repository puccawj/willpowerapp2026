import { Component, inject } from '@angular/core';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-team',
  imports: [],
  templateUrl: './team.html',
  styleUrl: './team.scss',
})
export class Team {
  private readonly data = inject(MockDataService);
  readonly team = this.data.team;
}
