import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Users, 
  History as HistoryIcon, 
  Trash2,
  Sun,
  Moon,
  Sunset,
  ClipboardList
} from 'lucide-react';
import { AttendanceRecord } from '@/types';

interface AttendanceHistoryListProps {
  data: AttendanceRecord[];
  onNavigateToAttendance: () => void;
  hasFilter: boolean;
  onDelete: (id: string) => void;
}

export const AttendanceHistoryList: React.FC<AttendanceHistoryListProps> = ({ 
  data, 
  onNavigateToAttendance,
  hasFilter,
  onDelete
}) => {
  
  const getAttendanceRate = (students: any[]) => {
    const presentCount = students.filter(s => s.isPresent).length;
    return students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;
  };

  // Helper para ícones e cores
  const getClassInfo = (notes?: string) => {
    if (!notes) return { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Geral', border: 'border-gray-200' };
    
    if (notes.includes('Manhã')) return { icon: Sun, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Manhã', border: 'border-orange-200' };
    if (notes.includes('Tarde')) return { icon: Sunset, color: 'text-blue-500', bg: 'bg-blue-100', label: 'Tarde', border: 'border-blue-200' };
    if (notes.includes('Novos') || notes.includes('Experimental')) return { icon: ClipboardList, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Novos', border: 'border-yellow-200' };
    if (notes.includes('Principal') || notes.includes('Noite')) return { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Noite', border: 'border-indigo-200' };
    
    return { icon: Calendar, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Geral', border: 'border-gray-200' };
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <HistoryIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhum registro encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {hasFilter
            ? 'Não há chamadas no período selecionado.'
            : 'Ainda não foram registradas chamadas.'
          }
        </p>
        {!hasFilter && (
          <Button onClick={onNavigateToAttendance} className="w-full sm:w-auto">
            Registrar Primeira Chamada
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {data.map((record) => {
        const attendanceRate = getAttendanceRate(record.students);
        const presentCount = record.students.filter(s => s.isPresent).length;
        const classInfo = getClassInfo(record.notes);
        const Icon = classInfo.icon;

        // CORREÇÃO DE DATA: Adicionamos T12:00:00 para garantir que o fuso horário não mude o dia
        const displayDate = new Date(record.date + 'T12:00:00');

        return (
          <Card key={record.id} className="hover:border-gray-400 transition-all dark:hover:border-gray-500">
            
            {/* --- CABEÇALHO VISUAL NOVO --- */}
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b dark:border-gray-800">
              <div className="flex items-center space-x-4">
                {/* Ícone da Turma */}
                <div className={`p-3 rounded-xl ${classInfo.bg} dark:bg-opacity-20`}>
                  <Icon className={`h-6 w-6 ${classInfo.color}`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg capitalize">
                      {displayDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </CardTitle>
                    {/* Etiqueta da Turma */}
                    <Badge variant="outline" className={`${classInfo.color} ${classInfo.border} bg-transparent`}>
                      {classInfo.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Registrado em {new Date(record.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-lg font-bold">
                    {presentCount}/{record.students.length}
                  </div>
                  <div className="text-xs text-gray-500">presentes</div>
                </div>

                <Badge
                  className={`px-3 py-1 text-sm ${attendanceRate >= 80 ? "bg-green-600 hover:bg-green-700" : attendanceRate >= 60 ? "bg-yellow-600 hover:bg-yellow-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {attendanceRate}%
                </Badge>

                {/* Botão de Excluir */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir chamada?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Isso apagará permanentemente o registro de <strong>{classInfo.label}</strong> do dia <strong>{displayDate.toLocaleDateString('pt-BR')}</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(record.id)} className="bg-red-600 hover:bg-red-700">
                        Sim, excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>

            {/* --- LISTA DE ALUNOS (MANTIDA IGUAL AO ORIGINAL) --- */}
            <CardContent className="pt-6">
              {record.notes && (
                <div className="mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Observações:</strong> {record.notes}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Presentes */}
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center text-sm sm:text-base">
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

                {/* Ausentes */}
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center text-sm sm:text-base">
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
  );
};