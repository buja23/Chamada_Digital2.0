import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyPDFData {
  month: string;
  year: number;
  studentStats: any[];
  monthData: any;
}

export const generateMonthlyPDF = (data: MonthlyPDFData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(220, 38, 38); // Red color
  doc.text(`Relatório Mensal - ${data.month} ${data.year}`, 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Resumo do mês
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text('Resumo do Mês', 20, 45);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Aulas: ${data.monthData.totalClasses}`, 20, 55);
  doc.text(`Total de Presenças: ${data.monthData.totalPresent}`, 20, 65);
  doc.text(`Total de Faltas: ${data.monthData.totalAbsent}`, 20, 75);
  doc.text(`Taxa de Presença: ${data.monthData.attendanceRate}%`, 20, 85);
  
  // Dias com aula
  doc.text(`Dias com aula: ${data.monthData.days.join(', ')}`, 20, 95);
  
  let yPosition = 110;
  
  // Tabela de alunos
  doc.setFontSize(14);
  doc.setTextColor(220, 38, 38);
  doc.text('Ranking de Alunos por Presença', 20, yPosition);
  yPosition += 15;
  
  // Preparar dados da tabela
  const tableData = data.studentStats.map((student, index) => {
    const attendanceDays = student.attendanceDays.map((day: any) => 
      `${day.day}${day.isPresent ? '✓' : '✗'}`
    ).join(' ');
    
    return [
      (index + 1).toString(),
      student.name,
      student.belt,
      `${student.presentClasses}/${student.totalClasses}`,
      `${student.attendanceRate}%`,
      attendanceDays
    ];
  });
  
  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Nome', 'Faixa', 'Aulas', 'Presença', 'Dias (✓=Presente ✗=Ausente)']],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontSize: 10
    },
    bodyStyles: { 
      textColor: [0, 0, 0],
      fontSize: 8
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 20, right: 20 },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 60, fontSize: 7 }
    }
  });
  
  // Adicionar legenda
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Legenda: ✓ = Presente, ✗ = Ausente', 20, finalY);
  
  // Save the PDF
  const fileName = `relatorio-mensal-${data.month.toLowerCase()}-${data.year}.pdf`;
  doc.save(fileName);
};