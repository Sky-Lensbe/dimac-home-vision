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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      quickscan_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          lead_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          lead_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quickscan_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quickscan_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quickscan_leads: {
        Row: {
          consent_timestamp: string | null
          consent_version: string | null
          construction_period: string | null
          created_at: string
          decision_timing: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          marketing_consent: boolean
          municipality: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          property_type: string | null
          situation: string | null
          status: string
        }
        Insert: {
          consent_timestamp?: string | null
          consent_version?: string | null
          construction_period?: string | null
          created_at?: string
          decision_timing?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          marketing_consent?: boolean
          municipality: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          property_type?: string | null
          situation?: string | null
          status?: string
        }
        Update: {
          consent_timestamp?: string | null
          consent_version?: string | null
          construction_period?: string | null
          created_at?: string
          decision_timing?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          marketing_consent?: boolean
          municipality?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          property_type?: string | null
          situation?: string | null
          status?: string
        }
        Relationships: []
      }
      quickscan_rate_limits: {
        Row: {
          count: number
          ip_hash: string
          window_start: string
        }
        Insert: {
          count?: number
          ip_hash: string
          window_start: string
        }
        Update: {
          count?: number
          ip_hash?: string
          window_start?: string
        }
        Relationships: []
      }
      quickscan_reports: {
        Row: {
          attention_points: Json
          barometer_category: string
          barometer_score_internal: number | null
          combination_advice: Json
          created_at: string
          delivery_status: string
          domain_scores: Json
          drone_recommendation: boolean
          id: string
          information_coverage: string
          lead_id: string
          recommended_package: string | null
          report_number: string
          report_snapshot: Json
          report_version: string
          rule_version: string
          safety_flags: Json
          unknown_information: Json
        }
        Insert: {
          attention_points: Json
          barometer_category: string
          barometer_score_internal?: number | null
          combination_advice: Json
          created_at?: string
          delivery_status?: string
          domain_scores: Json
          drone_recommendation?: boolean
          id?: string
          information_coverage: string
          lead_id: string
          recommended_package?: string | null
          report_number: string
          report_snapshot: Json
          report_version: string
          rule_version: string
          safety_flags: Json
          unknown_information: Json
        }
        Update: {
          attention_points?: Json
          barometer_category?: string
          barometer_score_internal?: number | null
          combination_advice?: Json
          created_at?: string
          delivery_status?: string
          domain_scores?: Json
          drone_recommendation?: boolean
          id?: string
          information_coverage?: string
          lead_id?: string
          recommended_package?: string | null
          report_number?: string
          report_snapshot?: Json
          report_version?: string
          rule_version?: string
          safety_flags?: Json
          unknown_information?: Json
        }
        Relationships: [
          {
            foreignKeyName: "quickscan_reports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quickscan_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      quickscan_responses: {
        Row: {
          answer_value: Json
          id: string
          lead_id: string
          question_id: string
          question_version: string
        }
        Insert: {
          answer_value: Json
          id?: string
          lead_id: string
          question_id: string
          question_version: string
        }
        Update: {
          answer_value?: Json
          id?: string
          lead_id?: string
          question_id?: string
          question_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "quickscan_responses_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "quickscan_leads"
            referencedColumns: ["id"]
          },
        ]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      quickscan_admin_allowed: { Args: { _email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
    },
  },
} as const
