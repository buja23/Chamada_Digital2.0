import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateStudentData, Student } from '@/types';
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';

const studentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthdate: z.string().min(1, 'Data de nascimento é obrigatória'),
  belt: z.string().min(1, 'Faixa é obrigatória'),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  student?: Student | null;
  onSuccess?: () => void;
}

const beltOptions = [
  'Branca',
  'Cinza',
  'Amarela',
  'Laranja',
  'Verde',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta'
];

export const StudentForm: React.FC<StudentFormProps> = ({ student, onSuccess }) => {
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  
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
    }
  });

  const selectedBelt = watch('belt');

  const onSubmit = async (data: StudentFormData) => {
    if (student) {
      await updateStudent.mutateAsync({ id: student.id, data });
    } else {
      await createStudent.mutateAsync(data);
      reset();
    }
    onSuccess?.();
  };

  const isLoading = createStudent.isPending || updateStudent.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome completo</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Digite o nome do aluno"
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthdate">Data de nascimento</Label>
        <Input
          id="birthdate"
          type="date"
          {...register('birthdate')}
        />
        {errors.birthdate && (
          <p className="text-sm text-red-600">{errors.birthdate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Faixa</Label>
        <Select value={selectedBelt} onValueChange={(value) => setValue('belt', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a faixa" />
          </SelectTrigger>
          <SelectContent>
            {beltOptions.map((belt) => (
              <SelectItem key={belt} value={belt}>
                {belt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.belt && (
          <p className="text-sm text-red-600">{errors.belt.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : student ? 'Atualizar' : 'Cadastrar'}
      </Button>
    </form>
  );
};