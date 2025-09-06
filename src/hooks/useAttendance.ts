import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendance';
import { CreateAttendanceData } from '@/types';
import { toast } from 'sonner';

export const useAttendance = () => {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: attendanceService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useAttendanceByDateRange = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['attendance', 'range', startDate, endDate],
    queryFn: () => attendanceService.getByDateRange(startDate, endDate),
    enabled: !!(startDate && endDate),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateAttendanceData) => attendanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Chamada registrada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao registrar chamada. Tente novamente.');
    }
  });
};