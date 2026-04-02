export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          account_number: string | null
          address: string | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          discount_percent: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          discount_percent?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fuel_deliveries: {
        Row: {
          aircraft_tail_number: string | null
          aircraft_type: string | null
          created_at: string
          customer_id: string | null
          customer_name: string | null
          delivered_at: string
          driver_id: string
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          gallons: number
          id: string
          meter_start: number | null
          meter_stop: number | null
          notes: string | null
          price_per_gallon: number
          prist: boolean
          total_amount: number
          truck_id: string | null
        }
        Insert: {
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          delivered_at?: string
          driver_id: string
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          gallons: number
          id?: string
          meter_start?: number | null
          meter_stop?: number | null
          notes?: string | null
          price_per_gallon: number
          prist?: boolean
          total_amount: number
          truck_id?: string | null
        }
        Update: {
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string | null
          delivered_at?: string
          driver_id?: string
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          gallons?: number
          id?: string
          meter_start?: number | null
          meter_stop?: number | null
          notes?: string | null
          price_per_gallon?: number
          prist?: boolean
          total_amount?: number
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_prices: {
        Row: {
          created_at: string
          effective_date: string
          fuel_type: string
          id: string
          price_per_gallon: number
          set_by: string
        }
        Insert: {
          created_at?: string
          effective_date?: string
          fuel_type: string
          id?: string
          price_per_gallon: number
          set_by: string
        }
        Update: {
          created_at?: string
          effective_date?: string
          fuel_type?: string
          id?: string
          price_per_gallon?: number
          set_by?: string
        }
        Relationships: []
      }
      fuel_tickets: {
        Row: {
          aircraft_tail_number: string | null
          aircraft_type: string | null
          assigned_driver_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          customer_name: string | null
          delivery_id: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested: number | null
          id: string
          notes: string | null
          pilot_email: string | null
          pilot_phone: string | null
          prist: boolean
          requested_date: string | null
          requested_time: string | null
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          assigned_driver_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          customer_name?: string | null
          delivery_id?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested?: number | null
          id?: string
          notes?: string | null
          pilot_email?: string | null
          pilot_phone?: string | null
          prist?: boolean
          requested_date?: string | null
          requested_time?: string | null
          service_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          assigned_driver_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          customer_name?: string | null
          delivery_id?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested?: number | null
          id?: string
          notes?: string | null
          pilot_email?: string | null
          pilot_phone?: string | null
          prist?: boolean
          requested_date?: string | null
          requested_time?: string | null
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_tickets_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "fuel_deliveries"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          delivery_id: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          delivery_id?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string
          delivery_id?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "fuel_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          due_date: string
          id: string
          invoice_number: string
          paid_at: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          due_date: string
          id?: string
          invoice_number: string
          paid_at?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          due_date?: string
          id?: string
          invoice_number?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_requests: {
        Row: {
          acknowledged_by: string | null
          aircraft_tail_number: string | null
          aircraft_type: string | null
          created_at: string
          estimated_departure: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested: number | null
          id: string
          notes: string | null
          pilot_email: string | null
          pilot_name: string
          pilot_phone: string | null
          prist: boolean
          status: string
          updated_at: string
        }
        Insert: {
          acknowledged_by?: string | null
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          created_at?: string
          estimated_departure?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested?: number | null
          id?: string
          notes?: string | null
          pilot_email?: string | null
          pilot_name: string
          pilot_phone?: string | null
          prist?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          acknowledged_by?: string | null
          aircraft_tail_number?: string | null
          aircraft_type?: string | null
          created_at?: string
          estimated_departure?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          gallons_requested?: number | null
          id?: string
          notes?: string | null
          pilot_email?: string | null
          pilot_name?: string
          pilot_phone?: string | null
          prist?: boolean
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_fuelops_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "driver" | "billing_clerk"
      billing_cycle: "per_delivery" | "monthly"
      fuel_type: "100LL" | "Jet-A"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "driver", "billing_clerk"],
      billing_cycle: ["per_delivery", "monthly"],
      fuel_type: ["100LL", "Jet-A"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
    },
  },
} as const
