import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AdminDataService } from '../../core/services/admin-data.service';
import { StatCards, StatCardData } from '../../shared/stat-cards/stat-cards';

interface BranchBar {
  name: string;
  value: string;
  pct: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [StatCards],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly data = inject(AdminDataService);
  private readonly router = inject(Router);

  readonly statCards: StatCardData[] = [
    { label: 'Upcoming events', value: '9', trend: '+2', trendColor: 'var(--w-green)', sub: 'Across all branches' },
    { label: 'RSVP this month', value: '412', trend: '+18%', trendColor: 'var(--w-green)', sub: 'vs. last month' },
    { label: 'Donations this month', value: '$4,820', trend: '+6%', trendColor: 'var(--w-green)', sub: 'Money + goods (est.)' },
    { label: 'New members (30d)', value: '86', trend: '+11', trendColor: 'var(--w-green)', sub: 'Across all branches' },
  ];

  readonly branchBars: BranchBar[] = [
    { name: 'United States', value: '412 members', pct: '82%', color: 'var(--w-accent)' },
    { name: 'Canada', value: '268 members', pct: '54%', color: 'var(--w-gold)' },
    { name: 'Australia', value: '154 members', pct: '31%', color: 'var(--w-green)' },
  ];

  readonly rsvpBreakdown = [
    { label: 'Confirmed', value: 296, color: 'var(--w-green)' },
    { label: 'Maybe', value: 52, color: 'var(--w-gold)' },
    { label: 'Cancelled', value: 18, color: 'var(--w-red)' },
  ];

  readonly events = this.data.events;

  readonly statusColors: Record<string, string> = {
    Published: 'var(--w-accent)',
    Scheduled: 'var(--w-green)',
    Draft: 'var(--w-muted)',
    Closed: 'var(--w-ink-soft)',
    Ongoing: 'var(--w-gold)',
    Cancelled: 'var(--w-red)',
  };

  readonly rsvpSummary = computed(() => {
    const map = new Map<number, string>();
    for (const ev of this.events()) {
      map.set(ev.id, `${ev.going}✓ ${ev.maybe}? ${ev.cancel}✕`);
    }
    return map;
  });

  goEvents(): void {
    this.router.navigate(['/events']);
  }
}
