import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AttendanceRecord, CreateAttendanceData } from '@/types';

const ATTENDANCE_COLLECTION = 'attendance';

export const attendanceService = {
  async getAll(): Promise<AttendanceRecord[]> {
    const q = query(collection(db, ATTENDANCE_COLLECTION), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AttendanceRecord[];
  },

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

  async create(data: CreateAttendanceData): Promise<void> {
    const attendanceData = {
      ...data,
      createdAt: new Date().toISOString()
    };
    
    await addDoc(collection(db, ATTENDANCE_COLLECTION), attendanceData);
  }
};