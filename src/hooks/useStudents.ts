import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsService } from '@/services/students';
import { CreateStudentData } from '@/types';
import { toast } from 'sonner';

export const useStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: studentsService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStudentData) => studentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno cadastrado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao cadastrar aluno. Tente novamente.');
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateStudentData> }) => 
      studentsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar aluno. Tente novamente.');
    }
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => studentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Aluno removido com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao remover aluno. Tente novamente.');
    }
  });
};