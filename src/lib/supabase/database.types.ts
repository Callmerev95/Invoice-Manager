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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adjustments: {
        Row: {
          amount_sen: number
          created_at: string
          id: string
          invoice_id: string
          reason: string
        }
        Insert: {
          amount_sen: number
          created_at?: string
          id?: string
          invoice_id: string
          reason: string
        }
        Update: {
          amount_sen?: number
          created_at?: string
          id?: string
          invoice_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "adjustments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_series: {
        Row: {
          id: string
          next_seq: number
          pattern: string
          template_id: string
          user_id: string
        }
        Insert: {
          id?: string
          next_seq?: number
          pattern: string
          template_id: string
          user_id: string
        }
        Update: {
          id?: string
          next_seq?: number
          pattern?: string
          template_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_series_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          accent_color: string | null
          business_address: string | null
          business_email: string | null
          business_line: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string
          currency: string
          due_date: string
          due_days: number
          footer_note: string | null
          id: string
          invoice_title: string
          issue_date: string | null
          logo_path: string | null
          number: string
          pattern: string
          payment_terms: string | null
          payment_to: string | null
          seq: number
          signature_image_path: string | null
          signature_text: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          tax_label: string
          tax_rate_bps: number
          template_id: string | null
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string | null
          business_address?: string | null
          business_email?: string | null
          business_line?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name: string
          created_at?: string
          currency?: string
          due_date: string
          due_days?: number
          footer_note?: string | null
          id?: string
          invoice_title?: string
          issue_date?: string | null
          logo_path?: string | null
          number?: string
          pattern?: string
          payment_terms?: string | null
          payment_to?: string | null
          seq?: number
          signature_image_path?: string | null
          signature_text?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_label?: string
          tax_rate_bps?: number
          template_id?: string | null
          token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string | null
          business_address?: string | null
          business_email?: string | null
          business_line?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string
          currency?: string
          due_date?: string
          due_days?: number
          footer_note?: string | null
          id?: string
          invoice_title?: string
          issue_date?: string | null
          logo_path?: string | null
          number?: string
          pattern?: string
          payment_terms?: string | null
          payment_to?: string | null
          seq?: number
          signature_image_path?: string | null
          signature_text?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          tax_label?: string
          tax_rate_bps?: number
          template_id?: string | null
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          position: number
          quantity: number
          subtotal_sen: number
          unit_price_sen: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          position: number
          quantity: number
          subtotal_sen: number
          unit_price_sen: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          position?: number
          quantity?: number
          subtotal_sen?: number
          unit_price_sen?: number
        }
        Relationships: [
          {
            foreignKeyName: "line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_sen: number
          created_at: string
          id: string
          invoice_id: string
          note: string | null
          paid_at: string
        }
        Insert: {
          amount_sen: number
          created_at?: string
          id?: string
          invoice_id: string
          note?: string | null
          paid_at?: string
        }
        Update: {
          amount_sen?: number
          created_at?: string
          id?: string
          invoice_id?: string
          note?: string | null
          paid_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          accent_color: string
          business_address: string | null
          business_email: string | null
          business_line: string | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          created_at: string
          due_days: number
          footer_note: string | null
          id: string
          invoice_title: string
          logo_path: string | null
          name: string
          number_pattern: string
          payment_terms: string | null
          payment_to: string | null
          signature_image_path: string | null
          signature_text: string | null
          tax_label: string
          tax_rate_bps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          business_address?: string | null
          business_email?: string | null
          business_line?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          due_days?: number
          footer_note?: string | null
          id?: string
          invoice_title?: string
          logo_path?: string | null
          name: string
          number_pattern?: string
          payment_terms?: string | null
          payment_to?: string | null
          signature_image_path?: string | null
          signature_text?: string | null
          tax_label?: string
          tax_rate_bps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          business_address?: string | null
          business_email?: string | null
          business_line?: string | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          created_at?: string
          due_days?: number
          footer_note?: string | null
          id?: string
          invoice_title?: string
          logo_path?: string | null
          name?: string
          number_pattern?: string
          payment_terms?: string | null
          payment_to?: string | null
          signature_image_path?: string | null
          signature_text?: string | null
          tax_label?: string
          tax_rate_bps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_invoice_from_template: {
        Args: {
          p_client_address: string | null
          p_client_email: string | null
          p_client_name: string
          p_due_days: number | null
          p_items: Json
          p_template_id: string
          p_user_id: string
        }
        Returns: string
      }
      get_public_invoice: { Args: { p_token: string }; Returns: Json }
      issue_invoice: {
        Args: { p_invoice_id: string }
        Returns: {
          due_date: string
          issue_date: string
          number: string
          token: string
        }[]
      }
      render_number: {
        Args: { p_pattern: string; p_seq: number }
        Returns: string
      }
      save_invoice_draft: {
        Args: {
          p_client_address: string | null
          p_client_email: string | null
          p_client_name: string
          p_due_days: number | null
          p_invoice_id: string
          p_items: Json
        }
        Returns: string
      }
    }
    Enums: {
      invoice_status: "draft" | "issued"
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
    ? DefaultSchema["Enums"][EnumName]
    : never

export const Constants = {
  public: {
    Enums: {
      invoice_status: ["draft", "issued"],
    },
  },
} as const