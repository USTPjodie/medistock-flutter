import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Device, Compartment, MedicationSchedule, DoseEvent, Notification, FamilyMember, Profile } from '../../types';

// Replace with your Supabase URL and anon key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Database schema type definition
export interface Database {
  public: {
    Tables: {
      devices: {
        Row: Device;
        Insert: Omit<Device, 'id' | 'created_at'>;
        Update: Partial<Device>;
      };
      compartments: {
        Row: Compartment;
        Insert: Omit<Compartment, 'id' | 'created_at'>;
        Update: Partial<Compartment>;
      };
      medication_schedule: {
        Row: MedicationSchedule;
        Insert: Omit<MedicationSchedule, 'id' | 'created_at'>;
        Update: Partial<MedicationSchedule>;
      };
      dose_events: {
        Row: DoseEvent;
        Insert: Omit<DoseEvent, 'id' | 'created_at'>;
        Update: Partial<DoseEvent>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Notification>;
      };
      family_members: {
        Row: FamilyMember;
        Insert: Omit<FamilyMember, 'id' | 'created_at'>;
        Update: Partial<FamilyMember>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Profile>;
      };
    };
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
