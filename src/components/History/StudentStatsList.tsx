import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Sun, 
  Moon, 
  Sunset, 
  ClipboardList 
} from 'lucide-react';
import { StudentStats, StudentCategory } from '@/types';

// Estendemos o tipo para garantir que o componente saiba que existe 'category'
interface StudentStatsWithCategory extends StudentStats {
  category?: StudentCategory;
}

interface StudentStatsListProps {
  stats: StudentStatsWithCategory[];
  onNavigateToRegister: () => void;
}

export const StudentStatsList: React.FC<StudentStatsListProps> = ({ 
  stats, 
  onNavigateToRegister 
}) => {

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

  // Helper visual para identificar a turma do aluno
  const getCategoryInfo = (category?: string) => {
    const map: Record<string, any> = {
      'morning': { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Manhã' },
      'afternoon': { icon: Sunset, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Tarde' },
      'regular': { icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Noite' },
      'trial': { icon: ClipboardList, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Em Teste' },
    };
    return map[category || 'regular'] || map['regular'];
  };

  if (stats.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhum aluno encontrado
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Tente ajustar os filtros ou cadastre novos alunos.
        </p>
        <Button onClick={onNavigateToRegister} className="w-full sm:w-auto">
          Gerenciar Alunos
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((student) => {
        const categoryInfo = getCategoryInfo(student.category);
        const CategoryIcon = categoryInfo.icon;

        return (
          <Card key={student.id} className="hover:border-gray-400 transition-colors group relative overflow-hidden">
            {/* Barra lateral colorida indicando status de presença */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${student.attendanceRate > 75 ? 'bg-green-500' : student.attendanceRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
            
            <CardContent className="p-5 pl-7"> {/* Padding left maior por causa da barra */}
              
              {/* Cabeçalho do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Ícone da Turma (Pequeno, sobreposto) */}
                    <div className={`absolute -bottom-1 -right-1 p-1 rounded-full ${categoryInfo.bg} border border-white dark:border-gray-900`}>
                      <CategoryIcon className={`w-3 h-3 ${categoryInfo.color}`} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-base truncate max-w-[140px]" title={student.name}>
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`${getBeltColor(student.belt)} text-[10px] px-1.5 py-0 h-5 border-0 shadow-sm`}>
                        {student.belt}
                      </Badge>
                      <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 bg-gray-50 dark:bg-gray-800 rounded">
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xl font-bold ${student.attendanceRate > 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {student.attendanceRate}%
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Presença</p>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-4">
                <Progress value={student.attendanceRate} className="h-1.5" />
              </div>

              {/* Grid de Estatísticas */}
              <div className="grid grid-cols-3 gap-2 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="block text-lg font-bold text-gray-900 dark:text-white">
                    {student.totalClasses}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-medium">Aulas</span>
                </div>
                <div className="text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                  <span className="block text-lg font-bold text-green-600">
                    {student.presentClasses}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-medium">Presenças</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-red-500">
                    {student.absentClasses}
                  </span>
                  <span className="text-[10px] uppercase text-gray-500 font-medium">Faltas</span>
                </div>
              </div>

            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};