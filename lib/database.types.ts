
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: number
          created_at: string
          event_type: string
          vehicle_id: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          event_type: string
          vehicle_id?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          event_type?: string
          vehicle_id?: number | null
        }
        Relationships: []
      }
      financing_settings: {
        Row: {
          id: number
          max_amount: number
          max_installments: number
          interest_rate: number
          updated_at: string
        }
        Insert: {
          id?: number
          max_amount: number
          max_installments: number
          interest_rate: number
          updated_at?: string
        }
        Update: {
          id?: number
          max_amount?: number
          max_installments?: number
          interest_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: number
          created_at: string
          vehicle_id: number
          author_name: string
          rating: number
          comment: string
          is_approved: boolean
          admin_reply: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          vehicle_id: number
          author_name: string
          rating: number
          comment: string
          is_approved?: boolean
          admin_reply?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          vehicle_id?: number
          author_name?: string
          rating?: number
          comment?: string
          is_approved?: boolean
          admin_reply?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      vehicles: {
        Row: {
          id: number
          created_at: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          engine: string
          transmission: 'Automática' | 'Manual'
          fuelType: string
          vehicle_type: string
          description: string
          images: string[]
          is_featured: boolean
          is_sold: boolean
          display_order: number
          video_url: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          make: string
          model: string
          year: number
          price: number
          mileage: number
          engine: string
          transmission: 'Automática' | 'Manual'
          fuelType: string
          vehicle_type: string
          description: string
          images: string[]
          is_featured?: boolean
          is_sold?: boolean
          display_order?: number
          video_url?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          make?: string
          model?: string
          year?: number
          price?: number
          mileage?: number
          engine?: string
          transmission?: 'Automática' | 'Manual'
          fuelType?: string
          vehicle_type?: string
          description?: string
          images?: string[]
          is_featured?: boolean
          is_sold?: boolean
          display_order?: number
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      reorder_vehicles: {
        Args: {
          updates: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
