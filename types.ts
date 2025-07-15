
import type { Database } from './lib/database.types';

export type Vehicle = Database['public']['Tables']['vehicles']['Row'];
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert'];
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update'];

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert'];

export type Review = Database['public']['Tables']['reviews']['Row'];
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];


export type Settings = Database['public']['Tables']['settings']['Row'];

// Type for the form data. It's based on the Insert type from Supabase,
// which already defines `id` as optional, fitting both creation and editing scenarios.
// We omit `created_at` as it's managed by the database.
export type VehicleFormData = Omit<VehicleInsert, 'created_at' | 'display_order'>;

export type FinancingSettings = {
    interestRate: number;
    maxAmount: number;
    maxTerm: number;
};
