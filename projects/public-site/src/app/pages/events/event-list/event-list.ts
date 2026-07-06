import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';

type FilterKey = 'upcoming' | 'past' | 'all';

@Component({
  selector: 'app-event-list',
  imports: [RouterLink],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList {
  private readonly data = inject(MockDataService);

  readonly filterOptions: { key: FilterKey; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'all', label: 'All events' },
  ];

  readonly filter = signal<FilterKey>('upcoming');

  readonly events = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.data.events : this.data.events.filter((ev) => ev.when === f);
  });

  setFilter(key: FilterKey): void {
    this.filter.set(key);
  }
}
