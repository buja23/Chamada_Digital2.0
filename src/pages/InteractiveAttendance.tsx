import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudents } from '@/hooks/useStudents';
import { useCreateAttendance } from '@/hooks/useAttendance';
import { StudentAttendance } from '@/types';
import { MousePointerClick, Check, X, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const InteractiveAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { data: students = [], isLoading } = useStudents();
  const createAttendance = useCreateAttendance();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);

  const currentStudent = students[currentIndex];

  const handlePresent = () => {
    if (currentStudent) {
      setAttendance(prev => ({
        ...prev,
        [currentStudent.id]: true
      }));
      nextStudent();
    }
  };

  const handleAbsent = () => {
    if (currentStudent) {
      setAttendance(prev => ({
        ...prev,
        [currentStudent.id]: false
      }));
      nextStudent();
    }
  };

  const nextStudent = () => {
    if (currentIndex < students.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const reset = () => {
    setCurrentIndex(0);
    setAttendance({});
    setIsComplete(false);
  };

  const handleFinish = async () => {
    const attendanceData = students.map(student => ({
      id: student.id,
      name: student.name,
      isPresent: attendance[student.id] || false
    }));

    await createAttendance.mutateAsync({
      date: selectedDate,
      students: attendanceData,
    });

    navigate('/history');
  };

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

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalResponded = Object.keys(attendance).length;

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

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <MousePointerClick className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum aluno cadastrado
        </h3>
        <p className="text-gray-600 mb-4">
          Cadastre alunos para usar a chamada interativa.
        </p>
        <Button onClick={() => navigate('/register')}>
          Cadastrar Aluno
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MousePointerClick className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chamada Interativa</h1>
            <p className="text-gray-600">
              {isComplete
                ? 'Chamada concluída!'
                : `Aluno ${currentIndex + 1} de ${students.length}`
              }
            </p>
          </div>
        </div>

        {!isComplete && (
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + (isComplete ? 1 : 0)) / students.length) * 100}%`
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {!isComplete ? (
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {currentStudent?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <CardTitle className="text-xl sm:text-2xl px-4">{currentStudent?.name}</CardTitle>
                <div className="flex justify-center">
                  <Badge className={getBeltColor(currentStudent?.belt || '')}>
                    {currentStudent?.belt}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 px-4">
                <p className="text-gray-600 text-sm sm:text-base">Este aluno está presente?</p>

                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={handleAbsent}
                    size="lg"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 px-6 sm:px-8 w-full sm:w-auto order-1 sm:order-1"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Ausente
                  </Button>

                  <Button
                    onClick={handlePresent}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 w-full sm:w-auto order-2 sm:order-2"
                  >
                    <Check className="h-5 w-5 mr-2" />
                    Presente
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center">
              <CardContent className="pt-6 pb-6 sm:pt-8 sm:pb-8 px-4">
                <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Chamada Concluída!
                </h2>

                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Todas as presenças foram registradas com sucesso.
                </p>

                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={handleFinish}
                    disabled={createAttendance.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createAttendance.isPending ? 'Salvando...' : 'Finalizar e Salvar'}
                  </Button>

                  <Button variant="outline" onClick={reset} className="w-full sm:w-auto">
                    Refazer Chamada
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progresso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Respondidos:</span>
                <span className="font-semibold">{totalResponded}/{students.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Presentes:</span>
                <span className="font-semibold text-green-600">{presentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ausentes:</span>
                <span className="font-semibold text-red-600">{totalResponded - presentCount}</span>
              </div>
            </CardContent>
          </Card>


          {/* Mobile Bottom Section */}
          <div className="lg:hidden space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Respondidos:</span>
                  <span className="font-semibold">{totalResponded}/{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Presentes:</span>
                  <span className="font-semibold text-green-600">{presentCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ausentes:</span>
                  <span className="font-semibold text-red-600">{totalResponded - presentCount}</span>
                </div>
              </CardContent>
            </Card>
            {totalResponded > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                    {students.slice(0, currentIndex + (isComplete ? 0 : 1)).map((student) => {
                      const isPresent = attendance[student.id];
                      return (
                        <div key={student.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{student.name}</span>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${isPresent === undefined
                              ? 'bg-gray-100 text-gray-600'
                              : isPresent
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {isPresent === undefined ? 'Pendente' : isPresent ? 'Presente' : 'Ausente'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {totalResponded > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {students.slice(0, currentIndex + (isComplete ? 0 : 1)).map((student) => {
                    const isPresent = attendance[student.id];
                    return (
                      <div key={student.id} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-2">{student.name}</span>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${isPresent === undefined
                            ? 'bg-gray-100 text-gray-600'
                            : isPresent
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {isPresent === undefined ? 'Pendente' : isPresent ? 'Presente' : 'Ausente'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};