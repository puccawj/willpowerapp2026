import { Component, computed, inject } from '@angular/core';
import { AdminDataService } from '../../core/services/admin-data.service';
import { PdfService } from '../../core/services/pdf.service';
import { ToastService } from '../../core/services/toast.service';
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

const COURSE_TITLE = 'The Path of Willpower';

@Component({
  selector: 'app-certificates',
  imports: [TableToolbar],
  templateUrl: './certificates.html',
  styleUrl: './certificates.scss',
})
export class Certificates {
  private readonly data = inject(AdminDataService);
  private readonly pdf = inject(PdfService);
  private readonly toast = inject(ToastService);

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

  private downloadFor(row: CertRow): void {
    this.pdf.downloadCertificate({
      kind: 'Certificate of Completion',
      recipientName: row.name,
      bodyLine: `Has successfully completed "${COURSE_TITLE}" with ${row.pctLabel} attendance, meeting the institute's passing criteria.`,
      refNo: row.certNo !== '—' ? row.certNo : `WPI-US-CERT-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      issueDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
  }

  toggle(row: CertRow): void {
    if (!row.eligible) return;
    if (!row.issued) {
      this.data.certIssued.update((m) => ({ ...m, [row.id]: true }));
      if (row.certNo === '—') {
        const generated = `WPI-US-CERT-${String(Math.floor(Math.random() * 9000) + 1000)}`;
        this.data.certStudents.update((list) => list.map((c) => (c.id === row.id ? { ...c, certNo: generated } : c)));
        row = { ...row, certNo: generated };
      }
    }
    this.downloadFor(row);
    this.toast.show(
      row.issued
        ? `Certificate re-sent to ${row.name} by email (simulated) — PDF downloaded.`
        : `Certificate issued to ${row.name} and emailed (simulated) — PDF downloaded.`,
      'success',
    );
  }

  bulkIssue(): void {
    const eligibleRows = this.rows().filter((r) => r.eligible && !r.issued);
    this.data.certIssued.update((m) => {
      const next = { ...m };
      this.data.certStudents().forEach((c) => {
        if (c.pct >= 80) next[c.id] = true;
      });
      return next;
    });
    this.data.certStudents.update((list) =>
      list.map((c) =>
        eligibleRows.some((r) => r.id === c.id) && c.certNo === '—'
          ? { ...c, certNo: `WPI-US-CERT-${String(Math.floor(Math.random() * 9000) + 1000)}` }
          : c,
      ),
    );
    const refreshed = this.rows();
    eligibleRows.forEach((r) => this.downloadFor(refreshed.find((x) => x.id === r.id) ?? r));
    this.toast.show(
      eligibleRows.length
        ? `${eligibleRows.length} certificate${eligibleRows.length === 1 ? '' : 's'} generated and emailed (simulated) — PDFs downloaded.`
        : 'No newly eligible students to issue.',
      eligibleRows.length ? 'success' : 'info',
    );
  }
}
