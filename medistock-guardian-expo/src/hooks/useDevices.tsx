import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type {
  Device, Compartment, MedicationSchedule, DoseEvent, Notification, FamilyMember, Profile
} from '../types';

// Mock data
const MOCK_DEVICE: Device = {
  id: 'device-001',
  name: 'My Smart Dispenser',
  owner_id: 'mock-user-123',
  last_seen: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const MOCK_COMPARTMENTS: Compartment[] = [
  { id: 'comp-001', device_id: 'device-001', index: 1, current_count: 15, capacity: 30, medication_name: 'Aspirin', created_at: new Date().toISOString() },
  { id: 'comp-002', device_id: 'device-001', index: 2, current_count: 8, capacity: 30, medication_name: 'Vitamin D', created_at: new Date().toISOString() },
  { id: 'comp-003', device_id: 'device-001', index: 3, current_count: 25, capacity: 30, medication_name: 'Omega-3', created_at: new Date().toISOString() },
  { id: 'comp-004', device_id: 'device-001', index: 4, current_count: 5, capacity: 30, medication_name: 'Probiotic', created_at: new Date().toISOString() },
];

// Mutable mock data for schedules (to support CRUD operations)
let MOCK_SCHEDULES: MedicationSchedule[] = [
  { id: 'sched-001', device_id: 'device-001', dose_time: '08:00', medication_name: 'Aspirin', dosage: '1 pill', enabled: true, created_at: new Date().toISOString() },
  { id: 'sched-002', device_id: 'device-001', dose_time: '12:00', medication_name: 'Vitamin D', dosage: '1 capsule', enabled: true, created_at: new Date().toISOString() },
  { id: 'sched-003', device_id: 'device-001', dose_time: '18:00', medication_name: 'Omega-3', dosage: '2 softgels', enabled: true, created_at: new Date().toISOString() },
  { id: 'sched-004', device_id: 'device-001', dose_time: '20:00', medication_name: 'Probiotic', dosage: '1 tablet', enabled: false, created_at: new Date().toISOString() },
];

// Helper to get current schedules
const getSchedules = () => [...MOCK_SCHEDULES];

// Helper to add schedule
const addSchedule = (schedule: MedicationSchedule) => {
  MOCK_SCHEDULES = [...MOCK_SCHEDULES, schedule];
  return schedule;
};

// Helper to update schedule
const updateScheduleData = (id: string, updates: Partial<MedicationSchedule>) => {
  MOCK_SCHEDULES = MOCK_SCHEDULES.map(s => s.id === id ? { ...s, ...updates } : s);
  return MOCK_SCHEDULES.find(s => s.id === id);
};

// Helper to delete schedule
const deleteScheduleData = (id: string) => {
  MOCK_SCHEDULES = MOCK_SCHEDULES.filter(s => s.id !== id);
  return id;
};

const MOCK_DOSE_EVENTS: DoseEvent[] = [
  { id: 'event-001', schedule_id: 'sched-001', device_id: 'device-001', scheduled_time: new Date().toISOString(), status: 'taken', actual_taken_time: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: 'event-002', schedule_id: 'sched-002', device_id: 'device-001', scheduled_time: new Date().toISOString(), status: 'pending', actual_taken_time: null, created_at: new Date().toISOString() },
  { id: 'event-003', schedule_id: 'sched-003', device_id: 'device-001', scheduled_time: new Date(Date.now() - 86400000).toISOString(), status: 'missed', actual_taken_time: null, created_at: new Date().toISOString() },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', user_id: 'mock-user-123', title: 'Dose Reminder', message: 'Time to take your Aspirin', type: 'dose_reminder', read: false, created_at: new Date().toISOString() },
  { id: 'notif-002', user_id: 'mock-user-123', title: 'Low Stock Alert', message: 'Probiotic is running low (5 remaining)', type: 'low_stock', read: false, created_at: new Date().toISOString() },
  { id: 'notif-003', user_id: 'mock-user-123', title: 'Missed Dose', message: 'You missed your Omega-3 dose yesterday', type: 'missed_dose', read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'family-001', device_id: 'device-001', user_id: 'mock-user-123', role: 'owner', created_at: new Date().toISOString() },
];

const MOCK_PROFILE: Profile = {
  id: 'profile-001',
  user_id: 'mock-user-123',
  full_name: 'Demo User',
  phone: '+1 555-0123',
  avatar_url: null,
  created_at: new Date().toISOString(),
};

export function useDevices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['devices', user?.id],
    queryFn: async () => [MOCK_DEVICE],
    enabled: !!user,
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => MOCK_DEVICE,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['devices'] }),
  });
}

export function useCompartments(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['compartments', deviceId],
    queryFn: async () => MOCK_COMPARTMENTS,
    enabled: !!deviceId,
  });
}

export function useMedicationSchedule(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['medication_schedule', deviceId],
    queryFn: async () => getSchedules(),
    enabled: !!deviceId,
  });
}

export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (schedule: Omit<MedicationSchedule, 'id' | 'created_at'>) => {
      const newSchedule: MedicationSchedule = {
        ...schedule,
        id: 'sched-' + Date.now(),
        created_at: new Date().toISOString(),
      };
      return addSchedule(newSchedule);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medication_schedule'] }),
  });
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MedicationSchedule> }) => {
      return updateScheduleData(id, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medication_schedule'] }),
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return deleteScheduleData(id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medication_schedule'] }),
  });
}

export function useDoseEvents(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['dose_events', deviceId],
    queryFn: async () => MOCK_DOSE_EVENTS,
    enabled: !!deviceId,
  });
}

export function useUpdateDoseEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => ({ id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dose_events'] }),
  });
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => MOCK_NOTIFICATIONS,
    enabled: !!user,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => ({ id, read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useFamilyMembers(deviceId: string | undefined) {
  return useQuery({
    queryKey: ['family_members', deviceId],
    queryFn: async () => MOCK_FAMILY_MEMBERS,
    enabled: !!deviceId,
  });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => MOCK_PROFILE,
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => updates,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}
