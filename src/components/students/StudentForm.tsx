import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Student } from '@/types';
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { compareTwoStrings } from 'string-similarity';

// Schema atualizado com as novas categorias
const studentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthdate: z.string().min(1, 'Data de nascimento é obrigatória'),
  belt: z.string().min(1, 'Faixa é obrigatória'),
  category: z.enum(['regular', 'trial', 'morning', 'afternoon']).default('trial'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSuccess?: () => void;
  existingStudents?: Student[];
}

const beltOptions = [
  'Branca', 'Cinza', 'Amarela', 'Laranja', 
  'Verde', 'Azul', 'Roxa', 'Marrom', 'Preta'
];

export const StudentForm: React.FC<StudentFormProps> = ({ student, onSuccess, existingStudents = [] }) => {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const [similarStudent, setSimilarStudent] = useState<Student | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<StudentFormData | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student?.name || '',
      birthdate: student?.birthdate || '',
      belt: student?.belt || '',
      category: student?.category || 'trial',
    }
  });

  const selectedBelt = watch('belt');
  const selectedCategory = watch('category');

  // Função para verificar similaridade entre nomes
  const checkForSimilarNames = (newName: string): Student | null => {
    const nameToCheck = newName.toLowerCase().trim();
    
    // Filtrar alunos atuais (ao editar)
    const filteredStudents = existingStudents.filter(s => 
      !student || s.id !== student.id
    );

    // Procurar por nome exato
    const exactMatch = filteredStudents.find(s => 
      s.name.toLowerCase().trim() === nameToCheck
    );
    
    if (exactMatch) {
      return exactMatch;
    }

    // Procurar por nomes similares (threshold de 70%)
    let bestMatch: Student | null = null;
    let bestScore = 0;

    filteredStudents.forEach(s => {
      const similarity = compareTwoStrings(nameToCheck, s.name.toLowerCase().trim());
      if (similarity > 0.7 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = s;
      }
    });

    return bestMatch;
  };

  const onSubmit = async (data: StudentFormData) => {
    // Verificar nomes duplicados/similares apenas ao criar novo aluno
    if (!student) {
      const similar = checkForSimilarNames(data.name);
      
      if (similar) {
        setSimilarStudent(similar);
        setPendingFormData(data);
        setShowConfirmation(true);
        return; // Não submeter ainda
      }
    }

    // Submeter normalmente se não houver duplicatas
    try {
      if (student) {
        await updateStudent.mutateAsync({ id: student.id, data });
      } else {
        await createStudent.mutateAsync(data);
        reset();
      }
      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (pendingFormData) {
      try {
        await createStudent.mutateAsync(pendingFormData);
        reset();
        onSuccess?.();
      } catch (error) {
        console.error(error);
      }
    }
    setShowConfirmation(false);
    setSimilarStudent(null);
    setPendingFormData(null);
  };

  const isLoading = createStudent.isPending || updateStudent.isPending;

  return (
    <>
      {/* Dialog de Confirmação para Nomes Duplicados/Similares */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aluno com nome parecido encontrado</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 mt-4">
              <p>
                Existe um aluno com um nome <strong>parecido ou igual</strong> no sistema:
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {similarStudent?.name}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Faixa: <span className="font-medium">{similarStudent?.belt}</span> • 
                  Data de registro: <span className="font-medium">
                    {similarStudent?.registrationDate && 
                      new Date(similarStudent.registrationDate).toLocaleDateString('pt-BR')}
                  </span>
                </p>
              </div>
              <p className="text-sm">
                Deseja cadastrar mesmo assim ou cancelar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowConfirmation(false);
              setSimilarStudent(null);
              setPendingFormData(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDuplicate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Cadastrar Mesmo Assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campos de Nome e Data (iguais) */}
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input id="name" {...register('name')} placeholder="Digite o nome" />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Data de nascimento</Label>
        <Input id="birthdate" type="date" {...register('birthdate')} />
        {errors.birthdate && <p className="text-sm text-red-600">{errors.birthdate.message}</p>}
      </div>

      {/* SELEÇÃO DE TURMA ATUALIZADA */}
      <div className="space-y-3 pt-2">
        <Label>Turma / Categoria</Label>
        <RadioGroup 
          defaultValue={selectedCategory} 
          onValueChange={(value) => setValue('category', value as any)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-blue-50 [&:has(:checked)]:border-blue-200">
            <RadioGroupItem value="regular" id="r-regular" />
            <Label htmlFor="r-regular" className="cursor-pointer">Principal (Noite)</Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-blue-50 [&:has(:checked)]:border-blue-200">
            <RadioGroupItem value="morning" id="r-morning" />
            <Label htmlFor="r-morning" className="cursor-pointer">Manhã</Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-blue-50 [&:has(:checked)]:border-blue-200">
            <RadioGroupItem value="afternoon" id="r-afternoon" />
            <Label htmlFor="r-afternoon" className="cursor-pointer">Tarde</Label>
          </div>
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-yellow-50 [&:has(:checked)]:border-yellow-200">
            <RadioGroupItem value="trial" id="r-trial" />
            <Label htmlFor="r-trial" className="cursor-pointer">Experimental (Novos)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Campo de Faixa e Botão (iguais) */}
      <div className="space-y-2">
        <Label>Faixa</Label>
        <Select value={selectedBelt} onValueChange={(value) => setValue('belt', value)}>
          <SelectTrigger><SelectValue placeholder="Selecione a faixa" /></SelectTrigger>
          <SelectContent>
            {beltOptions.map((belt) => <SelectItem key={belt} value={belt}>{belt}</SelectItem>)}
          </SelectContent>
        </Select>
        {errors.belt && <p className="text-sm text-red-600">{errors.belt.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : student ? 'Atualizar' : 'Cadastrar'}
      </Button>
    </form>
    </>
  );
};