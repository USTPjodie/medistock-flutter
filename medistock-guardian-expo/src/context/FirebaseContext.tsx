import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  Firestore,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Types
interface MedicationSchedule {
  id?: string;
  userId: string;
  medicationName: string;
  dosage: string;
  doseTime: string;
  enabled: boolean;
  scheduleType: 'time-specific' | 'duration-based';
  daysOfWeek?: number[];
  intervalHours?: number;
  createdAt: Timestamp;
}

interface DoseEvent {
  id?: string;
  userId: string;
  scheduleId: string;
  scheduledTime: Timestamp;
  actualTakenTime?: Timestamp;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  createdAt: Timestamp;
}

interface FirebaseContextType {
  // Auth
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Schedules
  schedules: MedicationSchedule[];
  addSchedule: (schedule: Omit<MedicationSchedule, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSchedule: (id: string, data: Partial<MedicationSchedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Dose Events
  doseEvents: DoseEvent[];
  addDoseEvent: (event: Omit<DoseEvent, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateDoseEvent: (id: string, data: Partial<DoseEvent>) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [doseEvents, setDoseEvents] = useState<DoseEvent[]>([]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Schedules listener
  useEffect(() => {
    if (!user) {
      setSchedules([]);
      return;
    }

    const q = query(
      collection(db, 'schedules'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scheduleList: MedicationSchedule[] = [];
      snapshot.forEach((doc) => {
        scheduleList.push({ id: doc.id, ...doc.data() } as MedicationSchedule);
      });
      setSchedules(scheduleList);
    });

    return unsubscribe;
  }, [user]);

  // Dose Events listener
  useEffect(() => {
    if (!user) {
      setDoseEvents([]);
      return;
    }

    const q = query(
      collection(db, 'doseEvents'),
      where('userId', '==', user.uid),
      orderBy('scheduledTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: DoseEvent[] = [];
      snapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() } as DoseEvent);
      });
      setDoseEvents(eventList);
    });

    return unsubscribe;
  }, [user]);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Schedule functions
  const addSchedule = async (scheduleData: Omit<MedicationSchedule, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    await addDoc(collection(db, 'schedules'), {
      ...scheduleData,
      userId: user.uid,
      createdAt: Timestamp.now(),
    });
  };

  const updateSchedule = async (id: string, data: Partial<MedicationSchedule>) => {
    await updateDoc(doc(db, 'schedules', id), data);
  };

  const deleteSchedule = async (id: string) => {
    await deleteDoc(doc(db, 'schedules', id));
  };

  // Dose Event functions
  const addDoseEvent = async (eventData: Omit<DoseEvent, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');
    await addDoc(collection(db, 'doseEvents'), {
      ...eventData,
      userId: user.uid,
      createdAt: Timestamp.now(),
    });
  };

  const updateDoseEvent = async (id: string, data: Partial<DoseEvent>) => {
    await updateDoc(doc(db, 'doseEvents', id), data);
  };

  const value: FirebaseContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    doseEvents,
    addDoseEvent,
    updateDoseEvent,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}
