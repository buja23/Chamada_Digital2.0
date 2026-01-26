import React from 'react';
import { Student } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, UserCheck } from 'lucide-react';
import { useDeleteStudent, useUpdateStudent } from '@/hooks/useStudents';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
}

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

const calculateAge = (birthdate: string) => {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

export const StudentCard: React.FC<StudentCardProps> = ({ student, onEdit }) => {
  const deleteStudent = useDeleteStudent();
  const updateStudent = useUpdateStudent();

  const handleDelete = () => {
    deleteStudent.mutate(student.id);
  };

  const handlePromote = async () => {
    try {
      // Promove para 'regular' (Principal/Noite) por padrão
      await updateStudent.mutateAsync({
        id: student.id,
        data: { category: 'regular' }
      });
      toast.success(`${student.name} foi efetivado para a turma principal!`);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao efetivar aluno.");
    }
  };

  // Configuração visual das categorias
  const categoryLabels = {
    trial: { text: 'Em Teste', color: 'bg-yellow-500' },
    morning: { text: 'Manhã', color: 'bg-orange-400' },
    afternoon: { text: 'Tarde', color: 'bg-blue-400' },
    regular: null // Não mostramos etiqueta para a turma padrão
  };

  const categoryInfo = student.category ? categoryLabels[student.category] : null;
  
  // CORREÇÃO: Definimos explicitamente se é 'trial' para usar na lógica do botão
  const isTrial = student.category === 'trial';

  return (
    <Card className="hover:shadow-md transition-shadow w-full relative overflow-hidden">
      {/* Etiqueta de Categoria (Mostra para Novos, Manhã e Tarde) */}
      {categoryInfo && (
        <div className={`absolute top-0 right-0 ${categoryInfo.color} text-white text-[10px] px-2 py-0.5 rounded-bl font-bold z-10`}>
          {categoryInfo.text}
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="max-w-[70%]">
          <h3 className="font-semibold text-base sm:text-lg truncate" title={student.name}>
            {student.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600">{calculateAge(student.birthdate)} anos</p>
        </div>
        
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          {/* Botão de Efetivar - Só aparece se for aluno novo (trial) */}
          {isTrial && (
             <Button
              variant="ghost"
              size="sm"
              onClick={handlePromote}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
              title="Efetivar Aluno (Mover para Principal)"
            >
              <UserCheck className="h-4 w-4" />
            </Button>
          )}

          {onEdit && (
            <Button
              variant="ghost"
              size="sm" 
              onClick={() => onEdit(student)}
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o aluno <strong>{student.name}</strong>? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">Faixa:</span>
            <Badge className={getBeltColor(student.belt)}>
              {student.belt}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-600">Matrícula:</span>
            <span className="text-xs sm:text-sm font-medium">
              {new Date(student.registrationDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};