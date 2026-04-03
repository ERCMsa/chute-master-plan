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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      demand_list_items: {
        Row: {
          created_at: string
          demand_list_id: string
          id: string
          requested_quantity: number
          stock_id: string
        }
        Insert: {
          created_at?: string
          demand_list_id: string
          id?: string
          requested_quantity: number
          stock_id: string
        }
        Update: {
          created_at?: string
          demand_list_id?: string
          id?: string
          requested_quantity?: number
          stock_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_list_items_demand_list_id_fkey"
            columns: ["demand_list_id"]
            isOneToOne: false
            referencedRelation: "demand_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_list_items_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_lists: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["list_status"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["list_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["list_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          created_at: string
          id: string
          item_name: string
          item_type: string
          length: number | null
          min_quantity: number
          quantity: number
          thickness: number | null
          updated_at: string
          width: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          item_name: string
          item_type?: string
          length?: number | null
          min_quantity?: number
          quantity?: number
          thickness?: number | null
          updated_at?: string
          width?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          item_name?: string
          item_type?: string
          length?: number | null
          min_quantity?: number
          quantity?: number
          thickness?: number | null
          updated_at?: string
          width?: number | null
        }
        Relationships: []
      }
      supply_list_items: {
        Row: {
          created_at: string
          id: string
          stock_id: string
          supplied_quantity: number
          supply_list_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          stock_id: string
          supplied_quantity: number
          supply_list_id: string
        }
        Update: {
          created_at?: string
          id?: string
          stock_id?: string
          supplied_quantity?: number
          supply_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_list_items_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_list_items_supply_list_id_fkey"
            columns: ["supply_list_id"]
            isOneToOne: false
            referencedRelation: "supply_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      supply_lists: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["list_status"]
          updated_at: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["list_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["list_status"]
          updated_at?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "engineer" | "magazinier" | "stock_manager"
      list_status: "pending" | "approved" | "rejected"
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
      app_role: ["engineer", "magazinier", "stock_manager"],
      list_status: ["pending", "approved", "rejected"],
    },
  },
} as const
