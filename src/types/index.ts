export interface Student {
  id: string;
  name: string;
  birthdate: string;
  belt: string;
  registrationDate: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  students: StudentAttendance[];
  notes?: string;
  createdAt: string;
}

export interface StudentAttendance {
  id: string;
  name: string;
  isPresent: boolean;
}

export interface CreateStudentData {
  name: string;
  birthdate: string;
  belt: string;
}

export interface CreateAttendanceData {
  date: string;
  students: StudentAttendance[];
  notes?: string;
}

export type StudentStats = { // Tipo base que você talvez já tenha
  id: string;
  name: string;
  belt: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendanceRate: number;
};

export type MonthlyStudentStats = StudentStats & { // Estende StudentStats
  attendanceDays: { day: number; isPresent: boolean }[];
};

export type MonthlyData = {
  month: number;
  year: number;
  records: AttendanceRecord[]; // Reutilize o tipo que você já tem
  totalClasses: number;
  totalPresent: number;
  totalAbsent: number;
  attendanceRate: number;
  days: number[];
};



export type StudentCategory = 'regular' | 'trial';

export interface Student {
  id: string;
  name: string;
  birthdate: string;
  belt: string;
  registrationDate: string;
  category?: StudentCategory; // Novo campo (opcional para manter compatibilidade com antigos)
}

export interface CreateStudentData {
  name: string;
  birthdate: string;
  belt: string;
  category: StudentCategory; // Novo campo
}

// ... restante dos tipos