import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCyI6iZg3J-MqWWhadkywU9xHUoYVklyRg",
  authDomain: "chamada-digital-9489e.firebaseapp.com",
  projectId: "chamada-digital-9489e",
  storageBucket: "chamada-digital-9489e.firebasestorage.app",
  messagingSenderId: "628094723107",
  appId: "1:628094723107:web:d1f71ef0a1af78e9d63d96",
  measurementId: "G-YSTWX2D8CK"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Para desenvolvimento local, descomente as linhas abaixo:
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;