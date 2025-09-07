import React from 'react';
import { Student } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { useDeleteStudent } from '@/hooks/useStudents';
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
    'branca': 'bg-gray-100 text-gray-800',
    'amarela': 'bg-yellow-100 text-yellow-800',
    'laranja': 'bg-orange-100 text-orange-800',
    'verde': 'bg-green-100 text-green-800',
    'azul': 'bg-blue-100 text-blue-800',
    'marrom': 'bg-amber-100 text-amber-800',
    'preta': 'bg-gray-800 text-white',
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

  const handleDelete = () => {
    deleteStudent.mutate(student.id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <h3 className="font-semibold text-base sm:text-lg truncate">{student.name}</h3>
          <p className="text-xs sm:text-sm text-gray-600">{calculateAge(student.birthdate)} anos</p>
        </div>
        
        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm" 
              onClick={() => onEdit(student)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 h-8 w-8 p-0">
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