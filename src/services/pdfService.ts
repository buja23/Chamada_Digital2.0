import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttendanceRecord } from '@/types';

export const generateAttendancePDF = (attendanceRecords: AttendanceRecord[]) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Red color
  doc.text('Relatório de Chamadas', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  doc.text(`Total de registros: ${attendanceRecords.length}`, 20, 40);

  let yPosition = 50;

  attendanceRecords.forEach((record) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Date header
    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    const dateFormatted = new Date(record.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`${dateFormatted}`, 20, yPosition);
    yPosition += 10;

    // Summary
    const presentCount = record.students.filter(s => s.isPresent).length;
    const totalCount = record.students.length;
    const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Presentes: ${presentCount}/${totalCount} (${attendanceRate}%)`, 20, yPosition);
    yPosition += 5;

    // Notes if any
    if (record.notes) {
      doc.text(`Observações: ${record.notes}`, 20, yPosition);
      yPosition += 5;
    }

    // Students table
    const tableData = record.students.map(student => [
      student.name,
      student.isPresent ? 'Presente' : 'Ausente'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Aluno', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [220, 38, 38],
        textColor: [255, 255, 255]
      },
      bodyStyles: { 
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: 20, right: 20 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 40, halign: 'center' }
      }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  });

  // Save the PDF
  const fileName = `historico-chamadas-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};