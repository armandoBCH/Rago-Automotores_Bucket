
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
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
        Relationships: [
          {
            foreignKeyName: "analytics_events_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: number
          created_at: string
          customer_name: string
          rating: number
          comment: string | null
          is_visible: boolean
          response_from_owner: string | null
          vehicle_id: number | null
          show_on_homepage: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          customer_name: string
          rating: number
          comment?: string | null
          is_visible?: boolean
          response_from_owner?: string | null
          vehicle_id?: number | null
          show_on_homepage?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          customer_name?: string
          rating?: number
          comment?: string | null
          is_visible?: boolean
          response_from_owner?: string | null
          vehicle_id?: number | null
          show_on_homepage?: boolean
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
      site_config: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
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
          fuel_type: string
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
          fuel_type: string
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
          fuel_type?: string
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
