import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransferRequest, Chute } from '@/types';

export function generateTransferPDF(request: TransferRequest, chutes: Chute[]) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BON DE TRANSFERT', 105, 25, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ERCM SA', 105, 35, { align: 'center' });

  doc.setDrawColor(180, 30, 30);
  doc.setLineWidth(1);
  doc.line(20, 40, 190, 40);

  // Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const y = 50;
  doc.text(`Transfer Number: ${request.transferNumber}`, 20, y);
  doc.text(`Date: ${request.dateCreated}`, 20, y + 8);
  doc.text(`Requester: ${request.requesterName}`, 20, y + 16);
  doc.text(`Unit: Production ${request.unit === 'unit1' ? 'Unit 1' : 'Unit 2'}`, 20, y + 24);

  // Table
  autoTable(doc, {
    startY: y + 35,
    head: [['#', 'Steel Type', 'Section', 'Length (mm)']],
    body: chutes.map((c, i) => [
      (i + 1).toString(),
      c.steelType,
      `${c.steelType} ${c.sectionSize}`,
      c.length.toString(),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  // Total
  const finalY = (doc as any).lastAutoTable?.finalY || 150;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Pieces: ${chutes.length}`, 20, finalY + 15);

  // Signature lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Signature Store Manager: ___________________', 20, finalY + 40);
  doc.text('Signature Receiver: ___________________', 110, finalY + 40);

  doc.save(`${request.transferNumber}.pdf`);
}
