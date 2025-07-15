export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[]

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
      reviews: {
        Row: {
          id: number
          created_at: string
          customer_name: string
          rating: number
          review_text: string | null
          is_approved: boolean
          title: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          customer_name: string
          rating: number
          review_text?: string | null
          is_approved?: boolean
          title?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          customer_name?: string
          rating?: number
          review_text?: string | null
          is_approved?: boolean
          title?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: number
          key: string
          value: Json
        }
        Insert: {
          id?: number
          key: string
          value: Json
        }
        Update: {
          id?: number
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
