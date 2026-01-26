// src/services/attendance.ts

import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  where,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AttendanceRecord, CreateAttendanceData } from '@/types';

const ATTENDANCE_COLLECTION = 'attendance';

export const attendanceService = {
  // Busca todas as chamadas (ordem decrescente)
  async getAll(): Promise<AttendanceRecord[]> {
    const q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];
  },

  // Busca por intervalo de datas (Útil para o Histórico e Relatórios)
  async getByDateRange(startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    const q = query(
      collection(db, ATTENDANCE_COLLECTION),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];
  },

  // Cria uma nova chamada
  // A lógica de qual turma é (Manhã/Tarde) já vem dentro de "data.notes" ou "data.students"
  async create(data: CreateAttendanceData): Promise<void> {
    const attendanceData = {
      ...data,
      createdAt: new Date().toISOString()
    };
    await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceData);
  },

  // ADICIONE ESTA FUNÇÃO
  async delete(id: string): Promise<void> {
    const docRef = doc(db, ATTENDANCE_COLLECTION, id);
    await deleteDoc(docRef);
  }
};