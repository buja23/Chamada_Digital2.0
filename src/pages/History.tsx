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
import { MonthlyStats } from '../components/History/MonthlyStats';


// HISTORY
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


