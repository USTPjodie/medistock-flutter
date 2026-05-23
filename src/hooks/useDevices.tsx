import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";

// ── Types ──
export interface Device {
  id: string;
  name: string;
  owner_id: string;
  last_seen: string | null;
  created_at: string;
}

export interface Compartment {
  id: string;
  device_id: string;
  index: number;
  current_count: number;
  capacity: number;
  medication_name: string | null;
  created_at: string;
}

export interface MedicationSchedule {
  id: string;
  device_id: string;
  dose_time: string;
  medication_name: string;
  dosage: string;
  enabled: boolean;
  created_at: string;
}

export interface DoseEvent {
  id: string;
  schedule_id: string;
  device_id: string;
  scheduled_time: string;
  status: string;
  actual_taken_time: string | null;
  created_at: string;
  medication_schedule?: MedicationSchedule;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  device_id: string;
  user_id: string;
  can_view_dashboard: boolean;
  can_receive_notifications: boolean;
  profiles?: { full_name: string | null; phone: string | null };
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

// ── Mock Data ──
const MOCK_DEVICE: Device = {
  id: "device-001",
  name: "Home Dispenser",
  owner_id: "mock-user-123",
  last_seen: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const MOCK_COMPARTMENTS: Compartment[] = [
  { id: "c1", device_id: "device-001", index: 1, current_count: 18, capacity: 30, medication_name: "Aspirin", created_at: new Date().toISOString() },
  { id: "c2", device_id: "device-001", index: 2, current_count: 7, capacity: 30, medication_name: "Vitamin D", created_at: new Date().toISOString() },
  { id: "c3", device_id: "device-001", index: 3, current_count: 25, capacity: 30, medication_name: "Omega-3", created_at: new Date().toISOString() },
  { id: "c4", device_id: "device-001", index: 4, current_count: 4, capacity: 30, medication_name: "Probiotic", created_at: new Date().toISOString() },
];

let mockSchedules: MedicationSchedule[] = [
  { id: "s1", device_id: "device-001", dose_time: "08:00", medication_name: "Aspirin", dosage: "1 pill", enabled: true, created_at: new Date().toISOString() },
  { id: "s2", device_id: "device-001", dose_time: "12:00", medication_name: "Vitamin D", dosage: "1 capsule", enabled: true, created_at: new Date().toISOString() },
  { id: "s3", device_id: "device-001", dose_time: "18:00", medication_name: "Omega-3", dosage: "2 softgels", enabled: true, created_at: new Date().toISOString() },
  { id: "s4", device_id: "device-001", dose_time: "20:00", medication_name: "Probiotic", dosage: "1 tablet", enabled: false, created_at: new Date().toISOString() },
];

const today = new Date();
const yesterday = new Date(Date.now() - 86400000);

let mockDoseEvents: DoseEvent[] = [
  { id: "e1", schedule_id: "s1", device_id: "device-001", scheduled_time: today.toISOString(), status: "taken", actual_taken_time: today.toISOString(), created_at: today.toISOString(), medication_schedule: mockSchedules[0] },
  { id: "e2", schedule_id: "s2", device_id: "device-001", scheduled_time: today.toISOString(), status: "pending", actual_taken_time: null, created_at: today.toISOString(), medication_schedule: mockSchedules[1] },
  { id: "e3", schedule_id: "s3", device_id: "device-001", scheduled_time: today.toISOString(), status: "upcoming", actual_taken_time: null, created_at: today.toISOString(), medication_schedule: mockSchedules[2] },
  { id: "e4", schedule_id: "s1", device_id: "device-001", scheduled_time: yesterday.toISOString(), status: "taken", actual_taken_time: yesterday.toISOString(), created_at: yesterday.toISOString(), medication_schedule: mockSchedules[0] },
  { id: "e5", schedule_id: "s2", device_id: "device-001", scheduled_time: yesterday.toISOString(), status: "missed", actual_taken_time: null, created_at: yesterday.toISOString(), medication_schedule: mockSchedules[1] },
  { id: "e6", schedule_id: "s3", device_id: "device-001", scheduled_time: yesterday.toISOString(), status: "taken", actual_taken_time: yesterday.toISOString(), created_at: yesterday.toISOString(), medication_schedule: mockSchedules[2] },
];

let mockNotifications: Notification[] = [
  { id: "n1", user_id: "mock-user-123", title: "Dose Reminder", body: "Time to take your Vitamin D", type: "missed_dose", read: false, created_at: new Date().toISOString() },
  { id: "n2", user_id: "mock-user-123", title: "Low Stock Alert", body: "Probiotic is running low (4 remaining)", type: "low_stock", read: false, created_at: new Date().toISOString() },
  { id: "n3", user_id: "mock-user-123", title: "System Update", body: "Dispenser firmware updated successfully", type: "system", read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_FAMILY: FamilyMember[] = [
  { id: "f1", device_id: "device-001", user_id: "mock-user-123", can_view_dashboard: true, can_receive_notifications: true, profiles: { full_name: "Demo User", phone: "+1 555-0123" } },
  { id: "f2", device_id: "device-001", user_id: "mock-user-456", can_view_dashboard: true, can_receive_notifications: false, profiles: { full_name: "Jane Doe", phone: "+1 555-0456" } },
];

const MOCK_PROFILE: Profile = {
  id: "p1",
  user_id: "mock-user-123",
  full_name: "Demo User",
  phone: "+1 555-0123",
  avatar_url: null,
  created_at: new Date().toISOString(),
};

// ── Hooks ──
export function useDevices() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["devices", user?.id], queryFn: async () => [MOCK_DEVICE], enabled: !!user });
}

export function useCreateDevice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (_name: string) => MOCK_DEVICE, onSuccess: () => qc.invalidateQueries({ queryKey: ["devices"] }) });
}

export function useCompartments(deviceId: string | undefined) {
  return useQuery({ queryKey: ["compartments", deviceId], queryFn: async () => MOCK_COMPARTMENTS, enabled: !!deviceId });
}

export function useMedicationSchedule(deviceId: string | undefined) {
  return useQuery({ queryKey: ["medication_schedule", deviceId], queryFn: async () => [...mockSchedules], enabled: !!deviceId });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: Omit<MedicationSchedule, "id" | "created_at">) => {
      const ns = { ...s, id: "s-" + Date.now(), created_at: new Date().toISOString() };
      mockSchedules = [...mockSchedules, ns];
      return ns;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medication_schedule"] }),
  });
}

export function useDoseEvents(deviceId: string | undefined) {
  return useQuery({ queryKey: ["dose_events", deviceId], queryFn: async () => [...mockDoseEvents], enabled: !!deviceId });
}

export function useUpdateDoseEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      mockDoseEvents = mockDoseEvents.map((e) => e.id === id ? { ...e, status, actual_taken_time: status === "taken" ? new Date().toISOString() : e.actual_taken_time } : e);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dose_events"] }),
  });
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["notifications", user?.id], queryFn: async () => [...mockNotifications], enabled: !!user });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { mockNotifications = mockNotifications.map((n) => n.id === id ? { ...n, read: true } : n); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useFamilyMembers(deviceId: string | undefined) {
  return useQuery({ queryKey: ["family_members", deviceId], queryFn: async () => MOCK_FAMILY, enabled: !!deviceId });
}

export function useProfile() {
  const { user } = useAuth();
  return useQuery({ queryKey: ["profile", user?.id], queryFn: async () => MOCK_PROFILE, enabled: !!user });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (_updates: { full_name?: string; phone?: string }) => _updates, onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }) });
}
