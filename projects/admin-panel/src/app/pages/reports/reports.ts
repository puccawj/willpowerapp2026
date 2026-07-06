import { Component, computed, signal } from '@angular/core';
import { FilterTabs, FilterOption } from '../../shared/filter-tabs/filter-tabs';
import { StatCards, StatCardData } from '../../shared/stat-cards/stat-cards';

interface ReportBar {
  name: string;
  value: string;
  pct: string;
  color: string;
}

interface ReportTabData {
  stats: StatCardData[];
  title: string;
  bars: ReportBar[];
}

const BRANCH_BARS: ReportBar[] = [
  { name: 'United States', value: '412 members', pct: '82%', color: 'var(--w-accent)' },
  { name: 'Canada', value: '268 members', pct: '54%', color: 'var(--w-gold)' },
  { name: 'Australia', value: '154 members', pct: '31%', color: 'var(--w-green)' },
];

const REPORT_DATA: Record<string, ReportTabData> = {
  events: {
    stats: [
      { label: 'Total events', value: '37' },
      { label: 'Avg. RSVP rate', value: '71%' },
      { label: 'Avg. attendance', value: '78%' },
      { label: 'Cancelled', value: '2' },
    ],
    title: 'RSVP volume by branch',
    bars: BRANCH_BARS,
  },
  learning: {
    stats: [
      { label: 'Active offerings', value: '12' },
      { label: 'Completion rate', value: '86%' },
      { label: 'Certificates issued', value: '214' },
      { label: 'At-risk students', value: '9' },
    ],
    title: 'Completion rate by course',
    bars: [
      { name: 'Introduction to Meditation', value: '91%', pct: '91%', color: 'var(--w-accent)' },
      { name: 'The Path of Willpower', value: '84%', pct: '84%', color: 'var(--w-gold)' },
      { name: 'Contemplative Study Circle', value: '77%', pct: '77%', color: 'var(--w-green)' },
      { name: 'Teachers in Training', value: '95%', pct: '95%', color: '#8a5a2e' },
    ],
  },
  donations: {
    stats: [
      { label: 'Total (YTD)', value: '$52,400' },
      { label: 'Money', value: '$44,100' },
      { label: 'Goods (est.)', value: '$8,300' },
      { label: 'Certificates sent', value: '186' },
    ],
    title: 'Donations by branch (YTD)',
    bars: BRANCH_BARS,
  },
  users: {
    stats: [
      { label: 'Total members', value: '834' },
      { label: 'New (30d)', value: '86' },
      { label: 'Active', value: '791' },
      { label: 'Suspended', value: '12' },
    ],
    title: 'Members by branch',
    bars: BRANCH_BARS,
  },
};

@Component({
  selector: 'app-reports',
  imports: [FilterTabs, StatCards],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  readonly tab = signal('events');

  readonly tabOptions: FilterOption[] = [
    { key: 'events', label: 'Events' },
    { key: 'learning', label: 'Learning' },
    { key: 'donations', label: 'Donations' },
    { key: 'users', label: 'Users' },
  ];

  readonly current = computed(() => REPORT_DATA[this.tab()]);

  setTab = (key: string) => this.tab.set(key);
}
