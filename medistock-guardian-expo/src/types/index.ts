// Database types matching Supabase schema

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
  medication_name: string | null;
  current_count: number;
  capacity: number;
  created_at: string;
}

export interface MedicationSchedule {
  id: string;
  device_id: string;
  medication_name: string;
  dose_time: string;
  dosage: string;
  enabled: boolean;
  created_at: string;
}

export interface DoseEvent {
  id: string;
  device_id: string;
  schedule_id: string;
  scheduled_time: string;
  actual_taken_time: string | null;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  created_at: string;
  medication_schedule?: MedicationSchedule;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  device_id: string;
  user_id: string;
  role: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    phone: string | null;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}
