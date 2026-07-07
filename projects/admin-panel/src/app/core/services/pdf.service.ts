import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CertificatePdfData {
  kind: string;
  recipientName: string;
  bodyLine: string;
  refNo: string;
  issueDate: string;
}

export interface ReportPdfData {
  reportName: string;
  stats: { label: string; value: string | number }[];
  chartTitle: string;
  rows: { name: string; value: string }[];
}

@Injectable({ providedIn: 'root' })
export class PdfService {
  /** Renders a decorative certificate/anumodana PDF and triggers a browser download. */
  downloadCertificate(data: CertificatePdfData): void {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // Background + border
    doc.setFillColor('#f4eddd');
    doc.rect(0, 0, pageW, pageH, 'F');
    doc.setDrawColor('#b98a32');
    doc.setLineWidth(1.2);
    doc.rect(10, 10, pageW - 20, pageH - 20);
    doc.setDrawColor('#c6a24a');
    doc.setLineWidth(0.4);
    doc.rect(14, 14, pageW - 28, pageH - 28);

    doc.setTextColor('#b98a32');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('WILLPOWER INSTITUTE', pageW / 2, 34, { align: 'center' });

    doc.setTextColor('#241c15');
    doc.setFontSize(22);
    doc.text(data.kind.toUpperCase(), pageW / 2, 48, { align: 'center' });

    doc.setFont('times', 'italic');
    doc.setFontSize(32);
    doc.text(data.recipientName, pageW / 2, 72, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor('#5a5044');
    const bodyLines = doc.splitTextToSize(data.bodyLine, pageW - 80);
    doc.text(bodyLines, pageW / 2, 90, { align: 'center' });

    doc.setFontSize(10.5);
    doc.setTextColor('#8a7d6a');
    doc.text(`Reference No. ${data.refNo}`, 24, pageH - 20);
    doc.text(`Issued ${data.issueDate}`, pageW - 24, pageH - 20, { align: 'right' });

    doc.save(`${data.kind.replace(/\s+/g, '-')}-${data.refNo}.pdf`);
  }

  /** Renders a simple statistics + table report and triggers a browser download. */
  downloadReport(data: ReportPdfData): void {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    doc.setTextColor('#241c15');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Willpower Institute — Report', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor('#8a7d6a');
    doc.text(data.reportName, 14, 27);
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageW - 14, 27, {
      align: 'right',
    });

    autoTable(doc, {
      startY: 34,
      head: [['Metric', 'Value']],
      body: data.stats.map((s) => [s.label, String(s.value)]),
      headStyles: { fillColor: '#241c15' },
      theme: 'striped',
    });

    const afterStatsY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor('#241c15');
    doc.text(data.chartTitle, 14, afterStatsY);

    autoTable(doc, {
      startY: afterStatsY + 4,
      head: [['Name', 'Value']],
      body: data.rows.map((r) => [r.name, r.value]),
      headStyles: { fillColor: '#a94b2c' },
      theme: 'striped',
    });

    doc.save(`${data.reportName.replace(/\s+/g, '-')}-report.pdf`);
  }
}
