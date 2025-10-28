import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAttendance, useAttendanceByDateRange } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { History as HistoryIcon, Calendar, Users, Search, Download, TrendingUp, User, BarChart3, FileDown } from 'lucide-react';
import { generateAttendancePDF } from '@/services/pdfService';
import { generateMonthlyPDF } from '@/services/monthlyPdfService';


// HISTORY Componente
export const History: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  // Use filtered query if dates are provided, otherwise use all attendance
  const {
    data: filteredAttendance,
    isLoading: isFilterLoading
  } = useAttendanceByDateRange(startDate, endDate);

  const {
    data: allAttendance = [],
    isLoading: isAllLoading
  } = useAttendance();

  const { data: students = [] } = useStudents();

  const attendanceData = (startDate && endDate) ? (filteredAttendance || []) : allAttendance;
  const isLoading = (startDate && endDate) ? isFilterLoading : isAllLoading;

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const handleDownloadPDF = () => {
    if (attendanceData.length === 0) {
      return;
    }
    generateAttendancePDF(attendanceData);
  };

  const getAttendanceRate = (students: any[]) => {
    const presentCount = students.filter(s => s.isPresent).length;
    return students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  };

  // Calcular estatísticas individuais dos alunos
  // Por enquanto pode deixar
  const studentStats = useMemo(() => {
    const stats = students.map(student => {
      let totalClasses = 0;
      let presentClasses = 0;

      attendanceData.forEach(record => {
        const studentAttendance = record.students.find(s => s.id === student.id);
        if (studentAttendance) {
          totalClasses++;
          if (studentAttendance.isPresent) {
            presentClasses++;
          }
        }
      });


      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      const absentClasses = totalClasses - presentClasses;

      return {
        ...student,
        totalClasses,
        presentClasses,
        absentClasses,
        attendanceRate
      };
    });

    // Ordenar por taxa de presença (maior para menor)
    return stats.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [students, attendanceData]);

  const getBeltColor = (belt: string) => {
    const colors: Record<string, string> = {
      'branca': 'bg-white text-gray-900 border border-gray-300',
      'cinza': 'bg-gray-500 text-white',
      'amarela': 'bg-yellow-100 text-yellow-800',
      'laranja': 'bg-orange-100 text-orange-800',
      'verde': 'bg-green-100 text-green-800',
      'azul': 'bg-blue-100 text-blue-800',
      'roxa': 'bg-purple-500 text-white',
      'marrom': 'bg-amber-700 text-white',
      'preta': 'bg-black text-white',
    };
    return colors[belt.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Histórico de Chamadas</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {attendanceData.length} registros encontrados
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={attendanceData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilter(!showFilter)}
          >
            <Search className="h-4 w-4 mr-2" />
            Filtrar por Data
          </Button>
        </div>
      </div>

      {showFilter && (
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">Data inicial</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">Data final</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2 sm:flex-col sm:items-stretch">
                <Button
                  variant="outline"
                  onClick={clearFilter}
                  disabled={!startDate && !endDate}
                  className="w-full"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico de</span> Chamadas
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Estatísticas</span> Individuais
          </TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Estatísticas</span> Mensais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          {attendanceData.length === 0 ? (
            <div className="text-center py-12">
              <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {(startDate && endDate)
                  ? 'Não há chamadas no período selecionado.'
                  : 'Ainda não foram registradas chamadas.'
                }
              </p>
              {(!startDate && !endDate) && (
                <Button onClick={() => window.location.href = '/attendance'} className="w-full sm:w-auto">
                  Registrar Primeira Chamada
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {attendanceData.map((record) => {
                const attendanceRate = getAttendanceRate(record.students);
                const presentCount = record.students.filter(s => s.isPresent).length;

                return (
                  <Card key={record.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                          <Calendar className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base sm:text-lg">
                            {new Date(record.date).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              timeZone: 'UTC'
                            })}
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Registrado em {new Date(record.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm sm:text-lg font-semibold">
                            {presentCount}/{record.students.length}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">presentes</div>
                        </div>

                        <Badge
                          variant={attendanceRate >= 80 ? "default" : attendanceRate >= 60 ? "secondary" : "destructive"}
                        >
                          {attendanceRate}%
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {record.notes && (
                        <div className="mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <strong>Observações:</strong> {record.notes}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center text-sm sm:text-base">
                            <Users className="h-4 w-4 mr-1" />
                            Presentes ({record.students.filter(s => s.isPresent).length})
                          </h4>
                          <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                            {record.students
                              .filter(student => student.isPresent)
                              .map(student => (
                                <div key={student.id} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {student.name}
                                </div>
                              ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-400 mb-2 flex items-center text-sm sm:text-base">
                            <Users className="h-4 w-4 mr-1" />
                            Ausentes ({record.students.filter(s => !s.isPresent).length})
                          </h4>
                          <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                            {record.students
                              .filter(student => !student.isPresent)
                              .map(student => (
                                <div key={student.id} className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate">
                                  {student.name}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {studentStats.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhum aluno cadastrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Cadastre alunos para ver as estatísticas de presença.
              </p>
              <Button onClick={() => window.location.href = '/register'} className="w-full sm:w-auto">
                Cadastrar Primeiro Aluno
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {studentStats.map((student) => (
                  <Card key={student.id}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg sm:text-xl font-bold text-red-600">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg truncate">{student.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getBeltColor(student.belt)} text-xs`}>
                                {student.belt}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:items-end space-y-2">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="text-lg sm:text-2xl font-bold text-red-600">
                                {student.attendanceRate}%
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">presença</div>
                            </div>
                          </div>

                          <div className="w-full sm:w-48">
                            <Progress
                              value={student.attendanceRate}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {student.totalClasses}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Total de Aulas
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-semibold text-red-600">
                            {student.presentClasses}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Presenças
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400">
                            {student.absentClasses}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Faltas
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <MonthlyStats attendanceData={attendanceData} students={students} getBeltColor={getBeltColor} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente de Estatísticas Mensais 
const MonthlyStats: React.FC<{
  attendanceData: any[],
  students: any[],
  getBeltColor: (belt: string) => string
}> = ({ attendanceData, students, getBeltColor }) => {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  // Agrupar dados por mês
  const monthlyData = useMemo(() => {
    const monthlyDataRecord: Record<string, any> = {};

    attendanceData.forEach(record => {
      const date = new Date(record.date);
      const year = date.getUTCFullYear();  // Mude para getUTCFullYear
      const month = date.getUTCMonth();

      if (year === selectedYear) {
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

        if (!monthlyDataRecord[monthKey]) {
          monthlyDataRecord[monthKey] = {
            month: month,
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
        monthlyDataRecord[monthKey].totalClasses++;
        monthlyDataRecord[monthKey].totalPresent += record.students.filter((s: any) => s.isPresent).length;
        monthlyDataRecord[monthKey].totalAbsent += record.students.filter((s: any) => !s.isPresent).length;
        monthlyDataRecord[monthKey].days.push(date.getUTCDate());
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
  const getMonthlyStudentStats = (monthIndex: number) => {
    const monthKey = `${selectedYear}-${monthIndex.toString().padStart(2, '0')}`;
    const monthData = monthlyData[monthKey];

    if (!monthData) return [];

    const studentStats = students.map(student => {
      let totalClasses = 0;
      let presentClasses = 0;
      const attendanceDays: { day: number, isPresent: boolean }[] = [];

      monthData.records.forEach((record: any) => {
        const studentAttendance = record.students.find((s: any) => s.id === student.id);
        if (!studentAttendance) {
          return;
        }
        totalClasses++;
        const day = new Date(record.date).getUTCDate();
        attendanceDays.push({ day, isPresent: studentAttendance.isPresent });
        if (studentAttendance.isPresent) {
          presentClasses++;
        }
      });

      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

      return {
        ...student,
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        attendanceRate,
        attendanceDays: attendanceDays.sort((a, b) => a.day - b.day)
      };
    }).filter(student => student.totalClasses > 0)
      .sort((a, b) => b.attendanceRate - a.attendanceRate);

    return studentStats;
  };

  const handleDownloadMonthlyPDF = (monthIndex: number) => {
    const monthName = months[monthIndex];
    const studentStats = getMonthlyStudentStats(monthIndex);
    const monthData = monthlyData[`${selectedYear}-${monthIndex.toString().padStart(2, '0')}`];

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

  const availableYears = [...new Set(attendanceData.map(record => new Date(record.date).getUTCFullYear()))].sort((a, b) => b - a);

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
                  {Object.values(monthlyData).reduce((acc: number, month: any) => acc + month.totalClasses, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Aulas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Object.values(monthlyData).reduce((acc: number, month: any) => acc + month.totalPresent, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total de Presenças</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {Object.values(monthlyData).reduce((acc: number, month: any) => acc + month.totalAbsent, 0)}
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

// Componente Modal de Detalhes do Mês
const MonthDetailModal: React.FC<{
  month: string;
  year: number;
  studentStats: any[];
  monthData: any;
  onClose: () => void;
  onDownloadPDF: () => void;
  getBeltColor: (belt: string) => string;
}> = ({ month, year, studentStats, monthData, onClose, onDownloadPDF, getBeltColor }) => {

  if (!monthData || studentStats.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {month} {year}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Nenhum dado disponível para este mês.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {month} {year}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {monthData.totalClasses} aulas • {monthData.totalPresent} presenças • {monthData.totalAbsent} faltas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={onDownloadPDF} size="sm" className="flex items-center space-x-2">
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">Baixar PDF</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </div>

      {/* Resumo do Mês */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
            {monthData.totalClasses}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total de Aulas</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
            {monthData.totalPresent}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Presenças</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-400">
            {monthData.totalAbsent}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Faltas</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {monthData.attendanceRate}%
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Taxa de Presença</div>
        </div>
      </div>

      {/* Ranking de Alunos */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ranking de Presença dos Alunos
        </h3>

        <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
          {studentStats.map((student, index) => (
            <Card key={student.id} className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                {/* Info do Aluno */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                      {student.name}
                    </h4>
                    <Badge className={`${getBeltColor(student.belt)} text-xs`}>
                      {student.belt}
                    </Badge>
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="flex flex-col sm:items-end space-y-2">
                  <div className="flex items-center justify-between sm:justify-end space-x-4 text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {student.presentClasses}/{student.totalClasses} aulas
                    </span>
                    <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
                      {student.attendanceRate}%
                    </div>
                  </div>
                  <Progress value={student.attendanceRate} className="w-full sm:w-32 h-2" />
                </div>
              </div>

              {/* Dias de Presença */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Dias do mês:
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {student.attendanceDays.map((attendance: any, dayIndex: number) => (
                    <div
                      key={dayIndex}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-medium ${attendance.isPresent
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}
                      title={`Dia ${attendance.day}: ${attendance.isPresent ? 'Presente' : 'Ausente'}`}
                    >
                      {attendance.day}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};