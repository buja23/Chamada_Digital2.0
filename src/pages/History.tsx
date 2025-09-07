import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAttendance, useAttendanceByDateRange } from '@/hooks/useAttendance';
import { History as HistoryIcon, Calendar, Users, Search } from 'lucide-react';

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

  const attendanceData = (startDate && endDate) ? (filteredAttendance || []) : allAttendance;
  const isLoading = (startDate && endDate) ? isFilterLoading : isAllLoading;

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const getAttendanceRate = (students: any[]) => {
    const presentCount = students.filter(s => s.isPresent).length;
    return students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
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
          <HistoryIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Histórico de Chamadas</h1>
            <p className="text-gray-600">
              {attendanceData.length} registros encontrados
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilter(!showFilter)}
        >
          <Search className="h-4 w-4 mr-2" />
          Filtrar por Data
        </Button>
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
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base sm:text-lg">
                        {new Date(record.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Registrado em {new Date(record.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm sm:text-lg font-semibold">
                        {presentCount}/{record.students.length}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">presentes</div>
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
                    <div className="mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Observações:</strong> {record.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center text-sm sm:text-base">
                        <Users className="h-4 w-4 mr-1" />
                        Presentes ({record.students.filter(s => s.isPresent).length})
                      </h4>
                      <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                        {record.students
                          .filter(student => student.isPresent)
                          .map(student => (
                            <div key={student.id} className="text-xs sm:text-sm text-gray-700 truncate">
                              {student.name}
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center text-sm sm:text-base">
                        <Users className="h-4 w-4 mr-1" />
                        Ausentes ({record.students.filter(s => !s.isPresent).length})
                      </h4>
                      <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                        {record.students
                          .filter(student => !student.isPresent)
                          .map(student => (
                            <div key={student.id} className="text-xs sm:text-sm text-gray-700 truncate">
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
    </div>
  );
};