import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Student, CreateStudentData } from '@/types';

const STUDENTS_COLLECTION = 'students';

export const studentsService = {
  async getAll(): Promise<Student[]> {
    const q = query(collection(db, STUDENTS_COLLECTION), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Student[];
  },

  async create(data: CreateStudentData): Promise<void> {
    const studentData = {
      ...data,
      registrationDate: new Date().toISOString()
    };
    
    await addDoc(collection(db, STUDENTS_COLLECTION), studentData);
  },

  async update(id: string, data: Partial<CreateStudentData>): Promise<void> {
    const studentRef = doc(db, STUDENTS_COLLECTION, id);
    await updateDoc(studentRef, data);
  },

  async delete(id: string): Promise<void> {
    const studentRef = doc(db, STUDENTS_COLLECTION, id);
    await deleteDoc(studentRef);
  }
};