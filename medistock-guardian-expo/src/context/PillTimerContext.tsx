import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Vibration, AppState, AppStateStatus } from 'react-native';

// Schedule Types
export type ScheduleType = 'time-specific' | 'duration-based';

export interface TimeSpecificSchedule {
  type: 'time-specific';
  time: string; // HH:MM format
  daysOfWeek: number[]; // 0-6, Sunday = 0
}

export interface DurationBasedSchedule {
  type: 'duration-based';
  intervalHours: number; // Take every X hours
  startTime: string; // HH:MM format
  endTime?: string; // Optional end time
}

// Types
export interface MedicationTimer {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  timeWindowMinutes: number; // Time-box window (default 15 min)
  status: 'pending' | 'active' | 'snoozed' | 'taken' | 'missed';
  snoozeCount: number;
  maxSnoozes?: number;
  lastSnoozeTime?: Date;
  notificationId?: string;
  scheduleType: ScheduleType;
  scheduleConfig: TimeSpecificSchedule | DurationBasedSchedule;
}

export interface TimerStats {
  totalTimers: number;
  completedOnTime: number;
  snoozed: number;
  missed: number;
  adherenceRate: number;
}

interface PillTimerContextType {
  // Active timers
  activeTimers: MedicationTimer[];
  currentTimer: MedicationTimer | null;
  
  // Timer actions
  startTimer: (medication: Omit<MedicationTimer, 'status' | 'snoozeCount'>) => void;
  takeMedication: (timerId: string) => void;
  snoozeTimer: (timerId: string, minutes: number) => void;
  dismissTimer: (timerId: string) => void;
  
  // Time-box feature
  getTimeRemaining: (timer: MedicationTimer) => { minutes: number; seconds: number; percentage: number };
  isInTimeWindow: (timer: MedicationTimer) => boolean;
  
  // Smart notifications
  isNotificationPersistent: boolean;
  restartNotification: (timerId: string) => void;
  
  // Stats
  stats: TimerStats;
  
  // Coach messages
  getCoachMessage: () => string;
}

const PillTimerContext = createContext<PillTimerContextType | undefined>(undefined);

// Coach messages for motivation
const coachMessages = {
  pending: [
    "Your medication is waiting. Take it now to stay on track!",
    "Small steps lead to big health improvements. Take your medication!",
    "Your future self will thank you for taking your medication on time.",
  ],
  snoozed: [
    "It's time! Don't let this slip away.",
    "You've snoozed once. Let's take it now before you forget!",
    "Snoozing is okay, but taking it is better!",
  ],
  urgent: [
    "⚠️ Time window closing! Take your medication now.",
    "Your medication window is almost over. Act now!",
    "Don't miss this dose! Take it now while you can.",
  ],
  success: [
    "Great job! You're building healthy habits.",
    "Medication taken! Your health journey continues.",
    "Excellent! Consistency is key to wellness.",
  ],
};

export function PillTimerProvider({ children }: { children: React.ReactNode }) {
  const [activeTimers, setActiveTimers] = useState<MedicationTimer[]>([]);
  const [currentTimer, setCurrentTimer] = useState<MedicationTimer | null>(null);
  const [stats, setStats] = useState<TimerStats>({
    totalTimers: 0,
    completedOnTime: 0,
    snoozed: 0,
    missed: 0,
    adherenceRate: 95,
  });
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new medication timer with time-box
  const startTimer = useCallback((medication: Omit<MedicationTimer, 'status' | 'snoozeCount'>) => {
    const newTimer: MedicationTimer = {
      ...medication,
      status: 'active',
      snoozeCount: 0,
      maxSnoozes: 3,
      timeWindowMinutes: medication.timeWindowMinutes || 15,
    };
    
    setActiveTimers((prev) => [...prev, newTimer]);
    setCurrentTimer(newTimer);
    setStats((prev) => ({ ...prev, totalTimers: prev.totalTimers + 1 }));
    
    // Start persistent notification
    startPersistentNotification(newTimer);
  }, []);

  // Calculate time remaining in time-box
  const getTimeRemaining = useCallback((timer: MedicationTimer) => {
    const now = new Date();
    const windowEnd = new Date(timer.scheduledTime.getTime() + timer.timeWindowMinutes * 60000);
    const totalWindowMs = timer.timeWindowMinutes * 60000;
    const remainingMs = Math.max(0, windowEnd.getTime() - now.getTime());
    
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    const percentage = Math.max(0, (remainingMs / totalWindowMs) * 100);
    
    return { minutes, seconds, percentage };
  }, []);

  // Check if still in time window
  const isInTimeWindow = useCallback((timer: MedicationTimer) => {
    const remaining = getTimeRemaining(timer);
    return remaining.minutes > 0 || remaining.seconds > 0;
  }, [getTimeRemaining]);

  // Take medication - completes the timer
  const takeMedication = useCallback((timerId: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, status: 'taken' } : t))
    );
    
    if (currentTimer?.id === timerId) {
      setCurrentTimer(null);
    }
    
    setStats((prev) => ({
      ...prev,
      completedOnTime: prev.completedOnTime + 1,
      adherenceRate: Math.round(((prev.completedOnTime + 1) / prev.totalTimers) * 100),
    }));
    
    stopPersistentNotification(timerId);
  }, [currentTimer]);

  // Smart snooze - responsible postponing
  const snoozeTimer = useCallback((timerId: string, minutes: number) => {
    setActiveTimers((prev) =>
      prev.map((t) => {
        if (t.id === timerId) {
          const newSnoozeCount = t.snoozeCount + 1;
          
          // If max snoozes reached, mark as missed
          const maxSnoozes = t.maxSnoozes ?? 3;
          if (newSnoozeCount > maxSnoozes) {
            setStats((s) => ({ ...s, missed: s.missed + 1 }));
            return { ...t, status: 'missed', snoozeCount: newSnoozeCount };
          }
          
          // Extend time window by snooze duration
          const newScheduledTime = new Date(Date.now() + minutes * 60000);
          
          setStats((s) => ({ ...s, snoozed: s.snoozed + 1 }));
          
          return {
            ...t,
            status: 'snoozed',
            snoozeCount: newSnoozeCount,
            lastSnoozeTime: new Date(),
            scheduledTime: newScheduledTime,
            timeWindowMinutes: Math.min(minutes, 10), // Max 10 min extension
          };
        }
        return t;
      })
    );
  }, []);

  // Dismiss timer (mark as missed)
  const dismissTimer = useCallback((timerId: string) => {
    setActiveTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, status: 'missed' } : t))
    );
    
    if (currentTimer?.id === timerId) {
      setCurrentTimer(null);
    }
    
    setStats((prev) => ({ ...prev, missed: prev.missed + 1 }));
    stopPersistentNotification(timerId);
  }, [currentTimer]);

  // Persistent notification system
  const startPersistentNotification = useCallback((timer: MedicationTimer) => {
    // Clear any existing interval
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
    
    // Create interval that restarts notification every 30 seconds until taken
    notificationIntervalRef.current = setInterval(() => {
      const current = activeTimers.find((t) => t.id === timer.id);
      if (current && current.status !== 'taken' && current.status !== 'missed') {
        // Vibration pattern: short, pause, short
        Vibration.vibrate([500, 500, 500]);
        
        // If time window expired, mark as missed
        if (!isInTimeWindow(current)) {
          dismissTimer(timer.id);
        }
      } else {
        // Stop if timer is completed
        if (notificationIntervalRef.current) {
          clearInterval(notificationIntervalRef.current);
        }
      }
    }, 30000); // Every 30 seconds
  }, [activeTimers, isInTimeWindow, dismissTimer]);

  const stopPersistentNotification = useCallback((timerId: string) => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
      notificationIntervalRef.current = null;
    }
  }, []);

  const restartNotification = useCallback((timerId: string) => {
    const timer = activeTimers.find((t) => t.id === timerId);
    if (timer && timer.status !== 'taken' && timer.status !== 'missed') {
      Vibration.vibrate([300, 200, 300, 200, 500]);
      startPersistentNotification(timer);
    }
  }, [activeTimers, startPersistentNotification]);

  // Get motivational coach message
  const getCoachMessage = useCallback(() => {
    if (!currentTimer) {
      return coachMessages.success[Math.floor(Math.random() * coachMessages.success.length)];
    }
    
    const remaining = getTimeRemaining(currentTimer);
    
    if (remaining.percentage < 20) {
      return coachMessages.urgent[Math.floor(Math.random() * coachMessages.urgent.length)];
    }
    
    if (currentTimer.status === 'snoozed') {
      return coachMessages.snoozed[Math.floor(Math.random() * coachMessages.snoozed.length)];
    }
    
    return coachMessages.pending[Math.floor(Math.random() * coachMessages.pending.length)];
  }, [currentTimer, getTimeRemaining]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (notificationIntervalRef.current) clearInterval(notificationIntervalRef.current);
    };
  }, []);

  const value: PillTimerContextType = {
    activeTimers,
    currentTimer,
    startTimer,
    takeMedication,
    snoozeTimer,
    dismissTimer,
    getTimeRemaining,
    isInTimeWindow,
    isNotificationPersistent: true,
    restartNotification,
    stats,
    getCoachMessage,
  };

  return (
    <PillTimerContext.Provider value={value}>
      {children}
    </PillTimerContext.Provider>
  );
}

export function usePillTimer() {
  const context = useContext(PillTimerContext);
  if (!context) {
    throw new Error('usePillTimer must be used within a PillTimerProvider');
  }
  return context;
}
