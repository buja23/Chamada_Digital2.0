// src/types/index.ts

// 1. Definimos as categorias disponíveis
export type StudentCategory = 'regular' | 'trial' | 'morning' | 'afternoon';

// 2. Interface do Aluno atualizada com a categoria
export interface Student {
  id: string;
  name: string;
  birthdate: string;
  belt: string;
  registrationDate: string;
  category?: StudentCategory; // Opcional para manter compatibilidade
}

// 3. Interface para criação (Categoria é obrigatória aqui)
export interface CreateStudentData {
  name: string;
  birthdate: string;
  belt: string;
  category: StudentCategory;
}

export interface StudentAttendance {
  id: string;
  name: string;
  isPresent: boolean;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  students: StudentAttendance[];
  notes?: string;
  createdAt: string; // Garanta que seu backend/firebase está salvando isso
}

export interface CreateAttendanceData {
  date: string;
  students: StudentAttendance[];
  notes?: string;
}

export type StudentStats = {
  id: string;
  name: string;
  belt: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendanceRate: number;
};

export type MonthlyStudentStats = StudentStats & {
  attendanceDays: { day: number; isPresent: boolean }[];
};

export type MonthlyData = {
  month: number;
  year: number;
  records: AttendanceRecord[];
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  days: number[];
};