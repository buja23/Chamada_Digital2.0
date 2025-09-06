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