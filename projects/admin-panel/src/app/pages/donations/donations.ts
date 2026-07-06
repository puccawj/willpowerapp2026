import { Component, computed, inject, signal } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { CrudModalService } from '../../core/services/crud-modal.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { FilterTabs, FilterOption } from '../../shared/filter-tabs/filter-tabs';
import { StatCards, StatCardData } from '../../shared/stat-cards/stat-cards';
import { Donation, DonationStatus, FieldDef } from '../../core/models/admin.models';

interface DonationRow extends Donation {
  donorLabel: string;
  statusKey: DonationStatus;
  statusLabel: string;
  statusColor: string;
  certLabel: string;
  certColor: string;
  actionLabel: string;
  isVerify: boolean;
  isIssue: boolean;
}

const STATUS_COLOR: Record<DonationStatus, string> = {
  pending: 'var(--w-muted)',
  received: 'var(--w-green)',
  verified: 'var(--w-accent)',
  rejected: 'var(--w-red)',
};

const STATUS_LABEL: Record<DonationStatus, string> = {
  pending: 'Pending',
  received: 'Received',
  verified: 'Verified',
  rejected: 'Rejected',
};

const FIELDS: FieldDef[] = [
  { key: 'donor', label: 'Donor name', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: ['Money', 'Goods'] },
  { key: 'amount', label: 'Amount / item', type: 'text' },
  { key: 'branch', label: 'Branch', type: 'select', options: ['USA', 'Canada', 'Australia'] },
  { key: 'event', label: 'Related event', type: 'text' },
  { key: 'proof', label: 'Proof photo', type: 'image' },
];

@Component({
  selector: 'app-donations',
  imports: [TableToolbar, FilterTabs, StatCards],
  templateUrl: './donations.html',
  styleUrl: './donations.scss',
})
export class Donations {
  private readonly data = inject(AdminDataService);
  private readonly modal = inject(CrudModalService);

  readonly filter = signal('all');

  readonly filterOptions: FilterOption[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'received', label: 'Received' },
    { key: 'verified', label: 'Verified' },
  ];

  private readonly rows = computed<DonationRow[]>(() => {
    const statusMap = this.data.donationStatus();
    const certMap = this.data.donationCert();
    return this.data.donations().map((d) => {
      const status = statusMap[d.id] ?? 'pending';
      const issued = !!certMap[d.id];
      const isVerify = status !== 'verified';
      const isIssue = !isVerify && !issued;
      return {
        ...d,
        donorLabel: d.anon ? 'Anonymous' : d.donor,
        statusKey: status,
        statusLabel: STATUS_LABEL[status],
        statusColor: STATUS_COLOR[status],
        certLabel: issued ? '✓ Issued' : status === 'verified' ? 'Not issued' : '—',
        certColor: issued ? 'var(--w-green)' : 'var(--w-muted)',
        actionLabel: isVerify ? 'Verify' : isIssue ? 'Issue certificate' : 'Resend email',
        isVerify,
        isIssue,
      };
    });
  });

  private readonly filteredRows = computed(() => {
    const f = this.filter();
    return f === 'all' ? this.rows() : this.rows().filter((d) => d.statusKey === f);
  });

  readonly ctrl = new ListController<DonationRow>(this.filteredRows);

  readonly stats = computed<StatCardData[]>(() => {
    const statusMap = this.data.donationStatus();
    const certMap = this.data.donationCert();
    const donations = this.data.donations();
    return [
      { label: 'Total this month', value: '$4,820' },
      { label: 'Pending review', value: donations.filter((d) => (statusMap[d.id] ?? 'pending') === 'pending').length },
      { label: 'Certificates issued', value: Object.values(certMap).filter(Boolean).length },
      { label: 'Anonymous donors', value: donations.filter((d) => d.anon).length },
    ];
  });

  setFilter = (key: string) => this.filter.set(key);

  action(row: DonationRow): void {
    if (row.isVerify) {
      this.data.donationStatus.update((m) => ({ ...m, [row.id]: 'verified' }));
    } else if (row.isIssue) {
      this.data.donationCert.update((m) => ({ ...m, [row.id]: true }));
    }
  }

  addDonation(): void {
    this.modal.open({
      title: 'Log Donation',
      fields: FIELDS,
      isEdit: false,
      values: { donor: '', type: 'Money', amount: '', branch: 'USA', event: '—' },
      onSave: (values) => {
        this.data.donations.update((list) => [
          ...list,
          { id: 'd' + (list.length + 1), anon: false, certNo: null, ...values } as Donation,
        ]);
      },
    });
  }

  editDonation(row: DonationRow): void {
    this.modal.open({
      title: 'Edit Donation',
      fields: FIELDS,
      isEdit: true,
      values: { donor: row.donor, type: row.type, amount: row.amount, branch: row.branch, event: row.event },
      onSave: (values) => {
        this.data.donations.update((list) => list.map((d) => (d.id === row.id ? { ...d, ...values } as Donation : d)));
      },
      onDelete: () => {
        this.data.donations.update((list) => list.filter((d) => d.id !== row.id));
      },
    });
  }
}
