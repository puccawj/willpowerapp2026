import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { ListController } from '../../core/list-controller';
import { TableToolbar } from '../../shared/table-toolbar/table-toolbar';
import { CertStudent } from '../../core/models/admin.models';

interface CertRow extends CertStudent {
  pctLabel: string;
  eligible: boolean;
  eligibleLabel: string;
  eligibleColor: string;
  issued: boolean;
  displayCertNo: string;
  issueLabel: string;
  actionLabel: string;
  actionColor: string;
}

@Component({
  selector: 'app-certificates',
  imports: [TableToolbar],
  templateUrl: './certificates.html',
  styleUrl: './certificates.scss',
})
export class Certificates {
  private readonly data = inject(AdminDataService);

  private readonly rows = computed<CertRow[]>(() => {
    const issuedMap = this.data.certIssued();
    return this.data.certStudents().map((c) => {
      const eligible = c.pct >= 80;
      const issued = !!issuedMap[c.id];
      return {
        ...c,
        pctLabel: c.pct + '%',
        eligible,
        eligibleLabel: eligible ? 'Eligible' : 'Not yet',
        eligibleColor: eligible ? 'var(--w-green)' : 'var(--w-muted)',
        issued,
        displayCertNo: issued ? c.certNo : '—',
        issueLabel: issued ? 'Sent to email' : eligible ? 'Ready to issue' : '—',
        actionLabel: issued ? 'Resend' : eligible ? 'Generate' : '—',
        actionColor: eligible || issued ? 'var(--w-accent)' : '#c9bfa8',
      };
    });
  });

  readonly ctrl = new ListController<CertRow>(this.rows);

  toggle(row: CertRow): void {
    if (!row.eligible) return;
    this.data.certIssued.update((m) => ({ ...m, [row.id]: true }));
  }

  bulkIssue(): void {
    this.data.certIssued.update((m) => {
      const next = { ...m };
      this.data.certStudents().forEach((c) => {
        if (c.pct >= 80) next[c.id] = true;
      });
      return next;
    });
  }
}
