import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface MonthlyPDFData {
  month: string;
  year: number;
  studentStats: any[];
  monthData: any;
}

export const generateMonthlyPDF = (data: MonthlyPDFData) => {
  const doc = new jsPDF('landscape'); // Modo paisagem para mais espaço
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(220, 38, 38); // Red color
  doc.text(`Relatório Mensal - ${data.month} ${data.year}`, 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
  
  // Resumo do mês
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text('Resumo do Mês', 20, 45);
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Aulas: ${data.monthData.totalClasses}`, 20, 55);
  doc.text(`Total de Presenças: ${data.monthData.totalPresent}`, 100, 55);
  doc.text(`Total de Faltas: ${data.monthData.totalAbsent}`, 180, 55);
  doc.text(`Taxa de Presença: ${data.monthData.attendanceRate}%`, 250, 55);
  
  // Dias com aula
  doc.text(`Dias com aula: ${data.monthData.days.join(', ')}`, 20, 65);
  
  let yPosition = 80;
  
  // Título da tabela
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text('Presença por Aluno e Dia', 20, yPosition);
  yPosition += 15;
  
  // Preparar cabeçalho da tabela (Nome + dias do mês)
  const headerRow = ['#', 'Nome do Aluno', 'Faixa', ...data.monthData.days.map((day: number) => day.toString()), 'Total', '%'];
  
  // Preparar dados da tabela
  const tableData = data.studentStats.map((student, index) => {
    const row = [
      (index + 1).toString(),
      student.name,
      student.belt
    ];
    
    // Adicionar presença para cada dia do mês
    data.monthData.days.forEach((day: number) => {
      const attendance = student.attendanceDays.find((att: any) => att.day === day);
      if (attendance) {
        row.push(attendance.isPresent ? 'P' : 'F');
      } else {
        row.push('-'); // Não havia aula neste dia para este aluno
      }
    });
    
    // Adicionar totais
    row.push(`${student.presentClasses}/${student.totalClasses}`);
    row.push(`${student.attendanceRate}%`);
    
    return row;
  });
  
  // Configurar estilos das colunas
  const columnStyles: any = {
    0: { cellWidth: 10, halign: 'center' }, // #
    1: { cellWidth: 40 }, // Nome
    2: { cellWidth: 20, halign: 'center' }, // Faixa
  };
  
  // Colunas dos dias (dinâmicas)
  data.monthData.days.forEach((_day: number, index: number) => {
    columnStyles[3 + index] = { cellWidth: 8, halign: 'center', fontSize: 8 };
  });
  
  // Colunas finais
  const totalIndex = 3 + data.monthData.days.length;
  columnStyles[totalIndex] = { cellWidth: 20, halign: 'center' }; // Total
  columnStyles[totalIndex + 1] = { cellWidth: 15, halign: 'center' }; // %
  
  autoTable(doc, {
    startY: yPosition,
    head: [headerRow],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold'
    },
    bodyStyles: { 
      textColor: [0, 0, 0],
      fontSize: 7
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: columnStyles,
    margin: { left: 20, right: 20 },
    didParseCell: function (data) {
      // Colorir células de presença
      if (data.row.index >= 0 && data.column.index >= 3 && data.column.index < totalIndex) {
        if (data.cell.text[0] === 'P') {
          data.cell.styles.textColor = [34, 197, 94]; // Verde para presente
          data.cell.styles.fontStyle = 'bold';
        } else if (data.cell.text[0] === 'F') {
          data.cell.styles.textColor = [239, 68, 68]; // Vermelho para ausente
          data.cell.styles.fontStyle = 'bold';
        }
      }
      
      // Colorir coluna de porcentagem
      if (data.column.index === totalIndex + 1) {
        const percentage = parseInt(data.cell.text[0]);
        if (percentage >= 80) {
          data.cell.styles.textColor = [34, 197, 94]; // Verde
        } else if (percentage >= 60) {
          data.cell.styles.textColor = [251, 191, 36]; // Amarelo
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Vermelho
        }
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
  
  // Adicionar legenda
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Legenda: P = Presente | F = Ausente | - = Sem aula registrada', 20, finalY);
  doc.text('Cores: Verde ≥80% | Amarelo ≥60% | Vermelho <60%', 20, finalY + 8);
  
  // Save the PDF
  const fileName = `relatorio-mensal-${data.month.toLowerCase()}-${data.year}.pdf`;
  doc.save(fileName);
};