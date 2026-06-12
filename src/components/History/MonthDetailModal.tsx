import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card'; // Adicione CardContent se usar
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileDown, Search, X } from 'lucide-react';
import type { MonthlyStudentStats, MonthlyData } from '../../types/index';



// Componente Modal de Detalhes do Mês
export const MonthDetailModal: React.FC<{
  month: string;
  year: number;
  studentStats: MonthlyStudentStats[];
  monthData: MonthlyData | undefined;
  onClose: () => void;
  onDownloadPDF: () => void;
  getBeltColor: (belt: string) => string;
}> = ({ month, year, studentStats, monthData, onClose, onDownloadPDF, getBeltColor }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar alunos baseado na busca por nome
  const filteredStudentStats = useMemo(() => {
    if (!searchTerm.trim()) {
      return studentStats;
    }
    return studentStats.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [studentStats, searchTerm]);

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
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ranking de Presença dos Alunos
          </h3>
          {filteredStudentStats.length !== studentStats.length && (
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {filteredStudentStats.length} de {studentStats.length}
            </span>
          )}
        </div>

        {/* Barra de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar aluno por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {filteredStudentStats.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              {searchTerm ? 'Nenhum aluno corresponde à sua busca.' : 'Nenhum aluno encontrado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
          {filteredStudentStats.map((student, index) => (
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
                  {student.attendanceDays.map((attendance: {day: number; isPresent:boolean }, dayIndex: number) => (
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
        )}
      </div>
    </div>
  );
};