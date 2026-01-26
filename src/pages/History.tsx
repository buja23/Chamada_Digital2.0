import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAttendance, useAttendanceByDateRange, useDeleteAttendance } from '@/hooks/useAttendance';
import { useStudents } from '@/hooks/useStudents';
import { History as HistoryIcon, Calendar, Download, TrendingUp, BarChart3, Filter } from 'lucide-react';
import { generateAttendancePDF } from '@/services/pdfService';

// Importação dos Componentes Separados
import { MonthlyStats } from '../components/History/MonthlyStats';
import { AttendanceHistoryList } from '../components/History/AttendanceHistoryList';
import { StudentStatsList } from '../components/History/StudentStatsList';

export const History: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const deleteAttendance = useDeleteAttendance(); // Hook de Delete

  const {
    data: filteredAttendance,
    isLoading: isFilterLoading
  } = useAttendanceByDateRange(startDate, endDate);

  const {
    data: allAttendance = [],
    isLoading: isAllLoading
  } = useAttendance();

  const { data: students = [] } = useStudents();

  // Lógica de unificação e filtro dos dados
  const rawData = (startDate && endDate) ? (filteredAttendance || []) : allAttendance;

  const attendanceData = useMemo(() => {
    if (categoryFilter === 'all') return rawData;

    const filterMap: Record<string, string> = {
      'morning': 'Manhã',
      'afternoon': 'Tarde',
      'regular': 'Principal',
      'trial': 'Novos'
    };

    const term = filterMap[categoryFilter];
    return rawData.filter(record => record.notes && record.notes.includes(term));
  }, [rawData, categoryFilter]);

  const isLoading = (startDate && endDate) ? isFilterLoading : isAllLoading;

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCategoryFilter('all');
  };

  const handleDownloadPDF = () => {
    if (attendanceData.length === 0) return;
    generateAttendancePDF(attendanceData);
  };

  // Função passada para o componente filho
  const handleDelete = (id: string) => {
    deleteAttendance.mutate(id);
  };

  // Lógica de Estatísticas Individuais
 // Lógica de Estatísticas Individuais (ATUALIZADA)
  const studentStats = useMemo(() => {
    // 1. Primeiro filtramos a LISTA DE ALUNOS baseado na categoria selecionada
    const filteredStudentsList = students.filter(student => {
      if (categoryFilter === 'all') return true;
      // Se o aluno não tem categoria, assume 'regular' (Noite)
      const studentCat = student.category || 'regular';
      return studentCat === categoryFilter;
    });

    // 2. Agora calculamos as estatísticas apenas para os alunos filtrados
    const stats = filteredStudentsList.map(student => {
      let totalClasses = 0;
      let presentClasses = 0;

      // Nota: As estatísticas são calculadas com base no 'attendanceData' que JÁ ESTÁ filtrado.
      // Isso significa que se você filtrar "Manhã", você verá:
      // - Apenas alunos da Manhã
      // - Apenas a presença deles nas aulas da Manhã (porque attendanceData também filtrou)
      attendanceData.forEach(record => {
        const studentAttendance = record.students.find(s => s.id === student.id);
        if (studentAttendance) {
          totalClasses++;
          if (studentAttendance.isPresent) presentClasses++;
        }
      });

      const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
      const absentClasses = totalClasses - presentClasses;

      return {
        ...student, // Espalha as propriedades do aluno (incluindo category)
        totalClasses,
        presentClasses,
        absentClasses,
        attendanceRate
      };
    });

    return stats.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }, [students, attendanceData, categoryFilter]); // Adicionado categoryFilter na dependência

  // ... (resto do código igual: isLoading, return, Tabs...)

  // No TabsContent de 'stats', passe a lista atualizada:
  /* <TabsContent value="stats" className="space-y-6">
        <StudentStatsList 
        stats={studentStats}
        onNavigateToRegister={() => window.location.href = '/register'}
        />
    </TabsContent> 
  */

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold">Histórico</h1>
            <p className="text-gray-600 text-sm">
              {attendanceData.length} registros
              {categoryFilter !== 'all' && <span className="ml-1 font-medium text-red-600">(Filtrado)</span>}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF} disabled={attendanceData.length === 0}>
            <Download className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button variant={showFilter ? "secondary" : "outline"} onClick={() => setShowFilter(!showFilter)}>
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
        </div>
      </div>

      {/* Painel de Filtros */}
      {showFilter && (
        <Card className="bg-gray-50/50 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Opções de Filtragem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Turma / Horário</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as turmas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    <SelectItem value="morning">Manhã</SelectItem>
                    <SelectItem value="afternoon">Tarde</SelectItem>
                    <SelectItem value="regular">Noite (Principal)</SelectItem>
                    <SelectItem value="trial">Novos (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
               <Button variant="ghost" size="sm" onClick={clearFilter} className="text-gray-500 hover:text-red-600">
                 Limpar Filtros
               </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="history"><Calendar className="h-4 w-4 mr-2"/> Chamadas</TabsTrigger>
          <TabsTrigger value="stats"><TrendingUp className="h-4 w-4 mr-2"/> Alunos</TabsTrigger>
          <TabsTrigger value="monthly"><BarChart3 className="h-4 w-4 mr-2"/> Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-6">
          <AttendanceHistoryList 
            data={attendanceData} 
            hasFilter={!!(startDate && endDate)}
            onNavigateToAttendance={() => window.location.href = '/attendance'}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <StudentStatsList 
            stats={studentStats}
            onNavigateToRegister={() => window.location.href = '/register'}
          />
        </TabsContent>

        <TabsContent value="monthly" className="space-y-6">
          <MonthlyStats 
            attendanceData={attendanceData} 
            students={students} 
            getBeltColor={getBeltColor} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};