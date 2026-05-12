import React, { useMemo } from 'react'; // Adicione useCallback se for usar
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, FileDown } from 'lucide-react';
import { generateMonthlyPDF } from '@/services/monthlyPdfService';
import { MonthDetailModal } from './MonthDetailModal';
import type { AttendanceRecord, Student, MonthlyData, MonthlyStudentStats } from '../../types/index';


export const MonthlyStats: React.FC<{
  attendanceData: AttendanceRecord[],
  students: Student[],
  getBeltColor: (belt: string) => string
}> = ({ attendanceData, students, getBeltColor }) => {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  // Agrupar dados por mês
  const monthlyData = useMemo(() => {
    const monthlyDataRecord: Record<string, MonthlyData> = {};

    attendanceData.forEach(record => {
      // Usar split em vez de new Date para evitar bugs de fuso horário
      const [year, month] = record.date.split('-').map(Number);

      if (year === selectedYear) {
        const monthKey = `${year}-${(month - 1).toString().padStart(2, '0')}`;

        if (!monthlyDataRecord[monthKey]) {
          monthlyDataRecord[monthKey] = {
            month: month - 1,
            year: year,
            records: [],
            totalClasses: 0,
            totalPresent: 0,
            totalAbsent: 0,
            attendanceRate: 0,
            days: []
          };
        }

        monthlyDataRecord[monthKey].records.push(record);

        // Criar mapa para agrupar presenças por dia e ID do aluno
        const dayStudentMap: Record<number, Record<string, boolean>> = {};
        
        monthlyDataRecord[monthKey].records.forEach(rec => {
          const [, , recDay] = rec.date.split('-').map(Number);
          if (!dayStudentMap[recDay]) {
            dayStudentMap[recDay] = {};
          }
          rec.students.forEach(student => {
            // Se o aluno estiver presente em qualquer chamada do dia, prevalece como true
            dayStudentMap[recDay][student.id] = dayStudentMap[recDay][student.id] || student.isPresent;
          });
        });

        // Adicionar dia ao array apenas se ainda não existir
        Object.keys(dayStudentMap).forEach(dayKey => {
          const dayNum = Number(dayKey);
          if (!monthlyDataRecord[monthKey].days.includes(dayNum)) {
            monthlyDataRecord[monthKey].days.push(dayNum);
          }
        });

        // Recalcular totais baseado no mapa de agrupamento
        monthlyDataRecord[monthKey].totalClasses = monthlyDataRecord[monthKey].days.length;
        
        let totalPresent = 0;
        let totalAbsent = 0;
        
        Object.values(dayStudentMap).forEach(studentsInDay => {
          Object.values(studentsInDay).forEach(isPresent => {
            if (isPresent) {
              totalPresent++;
            } else {
              totalAbsent++;
            }
          });
        });
        
        monthlyDataRecord[monthKey].totalPresent = totalPresent;
        monthlyDataRecord[monthKey].totalAbsent = totalAbsent;
      }
    });

    // Calcular taxa de presença
    Object.keys(monthlyDataRecord).forEach(key => {
      const data = monthlyDataRecord[key];
      const totalStudentDays = data.totalPresent + data.totalAbsent;
      data.attendanceRate = totalStudentDays > 0 ? Math.round((data.totalPresent / totalStudentDays) * 100) : 0;
      data.days.sort((a: number, b: number) => a - b);
    });

    return monthlyDataRecord;
  }, [selectedYear, attendanceData]);

  // Obter estatísticas de alunos por mês
  const getMonthlyStudentStats = (monthIndex: number): MonthlyStudentStats[] => {
    const monthKey = `${selectedYear}-${monthIndex.toString().padStart(2, '0')}`;
    const monthData: MonthlyData | undefined = monthlyData[monthKey];

    if (!monthData) return [];

    const studentStats = students.map((student: Student) => {
      // Criar mapa temporário agrupado por dia para evitar duplicatas
      const attendanceDaysMap: Record<number, boolean> = {};

      monthData.records.forEach((record: AttendanceRecord) => {
        const studentAttendance = record.students.find((s) => s.id === student.id);
        if (!studentAttendance) {
          return;
        }
        
        // Extrair o dia usando split em vez de new Date para evitar bugs de fuso horário
        const [, , day] = record.date.split('-').map(Number);
        
        // Se a presença for true, prevalece sobre false
        attendanceDaysMap[day] = attendanceDaysMap[day] || studentAttendance.isPresent;
      });

      // Converter objeto de volta para array ordenado
      const attendanceDays: { day: number, isPresent: boolean }[] = Object.entries(attendanceDaysMap)
        .map(([day, isPresent]) => ({ day: Number(day), isPresent }))
        .sort((a, b) => a.day - b.day);

      const totalClasses = attendanceDays.length;
      const presentClasses = attendanceDays.filter(d => d.isPresent).length;
      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

      return {
        ...student,
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        attendanceRate,
        attendanceDays
      } as MonthlyStudentStats;
    }).filter(student => student.totalClasses > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate);

    return studentStats;
  };

  const handleDownloadMonthlyPDF = (monthIndex: number) => {
    const monthName = months[monthIndex];
    const studentStats: MonthlyStudentStats[] = getMonthlyStudentStats(monthIndex);
    const monthData: MonthlyData | undefined = monthlyData[`${selectedYear}-${monthIndex.toString().padStart(2, '0')}`];

    if (!monthData || studentStats.length === 0) {
      return;
    }

    generateMonthlyPDF({
      month: monthName,
      year: selectedYear,
      studentStats,
      monthData
    });
  };


  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const availableYears = [...new Set(attendanceData.map(record => {
    const [year] = record.date.split('-').map(Number);
    return year;
  }))].sort((a, b) => b - a);

  if (attendanceData.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhum dado disponível
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Registre algumas chamadas para ver as estatísticas mensais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de detalhes do mês */}
      {selectedMonth !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <MonthDetailModal
              month={months[selectedMonth]}
              year={selectedYear}
              studentStats={getMonthlyStudentStats(selectedMonth)}
              monthData={monthlyData[`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`]}
              onClose={() => setSelectedMonth(null)}
              onDownloadPDF={() => handleDownloadMonthlyPDF(selectedMonth)}
              getBeltColor={getBeltColor}
            />
          </div>
        </div>
      )}

      {/* Seletor de Ano */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Estatísticas de {selectedYear}
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Grid de Meses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {months.map((monthName, monthIndex) => {
          const monthKey = `${selectedYear}-${monthIndex.toString().padStart(2, '0')}`;
          const data = monthlyData[monthKey];

          return (
            <Card
              key={monthIndex}
              className="dark:bg-gray-800 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              onClick={() => data && setSelectedMonth(monthIndex)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100">{monthName}</span>
                  {data && (
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={data.attendanceRate >= 80 ? "default" : data.attendanceRate >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {data.attendanceRate}%
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadMonthlyPDF(monthIndex);
                        }}
                        className="h-6 w-6 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <FileDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                {data ? (
                  <div className="space-y-4">
                    {/* Estatísticas do Mês */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center">
                      <div>
                        <div className="text-sm sm:text-lg font-semibold text-red-600 dark:text-red-400">
                          {data.totalClasses}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Aulas</div>
                      </div>
                      <div>
                        <div className="text-sm sm:text-lg font-semibold text-green-600 dark:text-green-400">
                          {data.totalPresent}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Presenças</div>
                      </div>
                      <div>
                        <div className="text-sm sm:text-lg font-semibold text-gray-600 dark:text-gray-400">
                          {data.totalAbsent}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Faltas</div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div>
                      <Progress value={data.attendanceRate} className="h-2" />
                    </div>

                    {/* Dias com Aula */}
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                        Dias com aula:
                      </h4>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {data.days.map((day: number, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-full"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <div className="text-gray-400 dark:text-gray-500 text-sm">
                      Nenhuma aula registrada
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Anual */}
      {Object.keys(monthlyData).length > 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Resumo Anual de {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {Object.values(monthlyData).reduce((acc: number, month: MonthlyData) => acc + month.totalClasses, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Aulas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.values(monthlyData).reduce((acc: number, month: MonthlyData) => acc + month.totalPresent, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Presenças</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {Object.values(monthlyData).reduce((acc: number, month: MonthlyData) => acc + month.totalAbsent, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Faltas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {Object.keys(monthlyData).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Meses Ativos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};