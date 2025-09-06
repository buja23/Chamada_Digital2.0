import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentCheckbox } from '@/components/attendance/StudentCheckbox';
import { useStudents } from '@/hooks/useStudents';
import { useCreateAttendance } from '@/hooks/useAttendance';
import { StudentAttendance } from '@/types';
import { ClipboardCheck, Calendar, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useStudents();
  const createAttendance = useCreateAttendance();
  
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const handleAttendanceChange = (studentId: string, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSubmit = async () => {
    const attendanceData = students.map(student => ({
      id: student.id,
      name: student.name,
      isPresent: attendance[student.id] || false
    }));

    await createAttendance.mutateAsync({
      date: selectedDate,
      students: attendanceData,
      notes: notes.trim() || undefined
    });

    // Redirecionar para histórico
    navigate('/history');
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = students.length;

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
        <ClipboardCheck className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chamada</h1>
          <p className="text-gray-600">Registre a presença dos alunos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Lista de Presença</span>
                </div>
                <div className="text-sm font-normal text-gray-600">
                  {presentCount}/{totalCount} presentes
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum aluno cadastrado. 
                    <Button variant="link" onClick={() => navigate('/register')}>
                      Cadastre o primeiro aluno
                    </Button>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
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
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de alunos:</span>
                <span className="font-semibold">{totalCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Presentes:</span>
                <span className="font-semibold text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ausentes:</span>
                <span className="font-semibold text-red-600">{totalCount - presentCount}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxa de presença:</span>
                  <span className="font-semibold">
                    {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Adicione observações sobre a aula..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            className="w-full"
            disabled={createAttendance.isPending || students.length === 0}
          >
            {createAttendance.isPending ? 'Salvando...' : 'Registrar Chamada'}
          </Button>
        </div>
      </div>
    </div>
  );
};