import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export type ConnectionStatus = 'checking' | 'connected' | 'error' | 'not-configured';

interface FirebaseConnection {
  status: ConnectionStatus;
  error: string | null;
  lastChecked: Date | null;
}

export function useFirebaseConnection() {
  const [connection, setConnection] = useState<FirebaseConnection>({
    status: 'checking',
    error: null,
    lastChecked: null,
  });

  const checkConnection = async () => {
    try {
      setConnection(prev => ({ ...prev, status: 'checking' }));
      
      // Try to fetch a single document from any collection
      // This tests if we can connect to Firestore
      const testQuery = query(collection(db, 'schedules'), limit(1));
      await getDocs(testQuery);
      
      setConnection({
        status: 'connected',
        error: null,
        lastChecked: new Date(),
      });
    } catch (error: any) {
      console.error('Firebase connection error:', error);
      
      let errorMessage = error.message;
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Check Firestore security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Firestore service unavailable.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Check your internet connection.';
      }
      
      setConnection({
        status: 'error',
        error: errorMessage,
        lastChecked: new Date(),
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return { ...connection, checkConnection };
}
