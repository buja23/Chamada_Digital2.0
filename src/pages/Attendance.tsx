import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentCheckbox } from '@/components/attendance/StudentCheckbox';
import { useStudents } from '@/hooks/useStudents';
import { useCreateAttendance } from '@/hooks/useAttendance';
import { ClipboardCheck, Calendar, Users, Sun, Sunset, Moon, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useStudents();
  const createAttendance = useCreateAttendance();
  
  // Ajuste aqui para pegar a data local correta, evitando problemas com UTC
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Pega o ano, mês e dia locais e formata como YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [notes, setNotes] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<'regular' | 'trial' | 'morning' | 'afternoon'>('regular');

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const category = student.category || 'regular';
      return category === activeTab;
    });
  }, [students, activeTab]);

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSubmit = async () => {
    const attendanceData = filteredStudents.map(student => ({
      id: student.id,
      name: student.name,
      isPresent: attendance[student.id] || false
    }));

    const listNames: Record<string, string> = {
      regular: 'Principal (Noite)',
      morning: 'Manhã',
      afternoon: 'Tarde',
      trial: 'Novos (Experimental)'
    };

    try {
      await createAttendance.mutateAsync({
        date: selectedDate, // Envia a data selecionada no formato YYYY-MM-DD
        students: attendanceData,
        notes: `${notes} [Lista: ${listNames[activeTab]}]`.trim()
      });

      navigate('/history');

    } catch (error) {
      console.error("Falha ao registrar a chamada:", error);
    }
  };

  const presentCount = filteredStudents.filter(s => attendance[s.id]).length;
  const totalCount = filteredStudents.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ClipboardCheck className="h-8 w-8 text-red-600" />
        <div>
          <h1 className="text-3xl font-bold">Chamada</h1>
          <p className="text-gray-600 dark:text-gray-400">Registre a presença dos alunos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Calendar className="h-5 w-5" />
                <span>Data da Aula</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="regular" value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1 gap-1">
              <TabsTrigger value="morning" className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-900 py-2">
                <Sun className="w-4 h-4 mr-2 text-orange-500" /> Manhã
              </TabsTrigger>
              <TabsTrigger value="afternoon" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 py-2">
                <Sunset className="w-4 h-4 mr-2 text-blue-500" /> Tarde
              </TabsTrigger>
              <TabsTrigger value="regular" className="data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900 py-2">
                <Moon className="w-4 h-4 mr-2 text-indigo-500" /> Noite
              </TabsTrigger>
              <TabsTrigger value="trial" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900 py-2">
                <ClipboardList className="w-4 h-4 mr-2 text-yellow-600" /> Novos
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 text-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {activeTab === 'regular' && 'Turma da Noite (Principal)'}
                    {activeTab === 'morning' && 'Turma da Manhã'}
                    {activeTab === 'afternoon' && 'Turma da Tarde'}
                    {activeTab === 'trial' && 'Alunos em Teste'}
                  </span>
                </div>
                <div className="text-sm font-normal text-gray-600 sm:text-right">
                  {presentCount}/{totalCount} presentes
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Nenhum aluno nesta turma.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/students')} className="p-4">
                    Gerenciar Alunos
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {filteredStudents.map((student) => (
                    <StudentCheckbox
                      key={student.id}
                      student={student}
                      isPresent={attendance[student.id] || false}
                      onChange={(isPresent) => 
                        handleAttendanceChange(student.id, isPresent)
                      }
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Resumo da Chamada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de alunos:</span>
                <span className="font-semibold">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Presentes:</span>
                <span className="font-semibold text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ausentes:</span>
                <span className="font-semibold text-red-600">{totalCount - presentCount}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Taxa de presença:</span>
                  <span className="font-semibold">
                    {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre a aula..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="text-sm"
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            className="w-full py-3"
            disabled={createAttendance.isPending || filteredStudents.length === 0}
          >
            {createAttendance.isPending ? 'Salvando...' : 'Registrar Chamada'}
          </Button>
        </div>
      </div>
    </div>
  );
};