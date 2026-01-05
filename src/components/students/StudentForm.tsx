import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Importe o RadioGroup
import { Student } from '@/types';
import { useCreateStudent, useUpdateStudent } from '@/hooks/useStudents';

// Atualizamos o schema para incluir a categoria
const studentSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  birthdate: z.string().min(1, 'Data de nascimento é obrigatória'),
  belt: z.string().min(1, 'Faixa é obrigatória'),
  category: z.enum(['regular', 'trial']).default('trial'), // Novo campo
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
      // Se estiver editando, usa o valor existente, senão "trial" (Experimental)
      category: student?.category || 'trial', 
    }
  });

  const selectedBelt = watch('belt');
  const selectedCategory = watch('category'); // Observa a categoria selecionada

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
      {/* Campo de Nome */}
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

      {/* Campo de Data de Nascimento */}
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

      {/* Novo Campo: Tipo de Matrícula */}
      <div className="space-y-3 pt-2">
        <Label>Tipo de Matrícula</Label>
        <RadioGroup 
          defaultValue={selectedCategory} 
          onValueChange={(value) => setValue('category', value as 'regular' | 'trial')}
          className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
        >
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex-1">
            <RadioGroupItem value="trial" id="r-trial" />
            <Label htmlFor="r-trial" className="cursor-pointer font-normal">
              Aluno Novo <span className="text-xs text-gray-500 block">(Experimental)</span>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors flex-1">
            <RadioGroupItem value="regular" id="r-regular" />
            <Label htmlFor="r-regular" className="cursor-pointer font-normal">
              Matriculado <span className="text-xs text-gray-500 block">(Principal)</span>
            </Label>
          </div>
        </RadioGroup>
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Campo de Faixa */}
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