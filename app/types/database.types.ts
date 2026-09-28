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
      ajustes: {
        Row: {
          creado_en: string | null
          id: string
          locale: string
          moneda: string
          tema: string
          usuario_id: string
        }
        Insert: {
          creado_en?: string | null
          id?: string
          locale?: string
          moneda?: string
          tema?: string
          usuario_id: string
        }
        Update: {
          creado_en?: string | null
          id?: string
          locale?: string
          moneda?: string
          tema?: string
          usuario_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          color: string
          creado_en: string | null
          id: string
          nombre: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          color?: string
          creado_en?: string | null
          id?: string
          nombre: string
          tipo: string
          usuario_id: string
        }
        Update: {
          color?: string
          creado_en?: string | null
          id?: string
          nombre?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      gastos: {
        Row: {
          categoria_id: string | null
          creado_en: string | null
          descripcion: string | null
          fecha: string
          id: string
          monto: number
          usuario_id: string
        }
        Insert: {
          categoria_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          fecha: string
          id?: string
          monto: number
          usuario_id: string
        }
        Update: {
          categoria_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          fecha?: string
          id?: string
          monto?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gastos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      ingresos: {
        Row: {
          categoria_id: string | null
          creado_en: string | null
          descripcion: string | null
          fecha: string
          id: string
          monto: number
          usuario_id: string
        }
        Insert: {
          categoria_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          fecha: string
          id?: string
          monto: number
          usuario_id: string
        }
        Update: {
          categoria_id?: string | null
          creado_en?: string | null
          descripcion?: string | null
          fecha?: string
          id?: string
          monto?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingresos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      metas: {
        Row: {
          completada: boolean
          creado_en: string | null
          fecha_limite: string | null
          id: string
          monto_actual: number
          monto_objetivo: number
          nombre: string
          usuario_id: string
        }
        Insert: {
          completada?: boolean
          creado_en?: string | null
          fecha_limite?: string | null
          id?: string
          monto_actual?: number
          monto_objetivo: number
          nombre: string
          usuario_id: string
        }
        Update: {
          completada?: boolean
          creado_en?: string | null
          fecha_limite?: string | null
          id?: string
          monto_actual?: number
          monto_objetivo?: number
          nombre?: string
          usuario_id?: string
        }
        Relationships: []
      }
      presupuestos: {
        Row: {
          anio: number
          categoria_id: string | null
          creado_en: string | null
          id: string
          mes: number | null
          monto_limite: number
          usuario_id: string
        }
        Insert: {
          anio: number
          categoria_id?: string | null
          creado_en?: string | null
          id?: string
          mes?: number | null
          monto_limite: number
          usuario_id: string
        }
        Update: {
          anio?: number
          categoria_id?: string | null
          creado_en?: string | null
          id?: string
          mes?: number | null
          monto_limite?: number
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presupuestos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          creado_en: string | null
          email: string
          id: string
          nombre: string
        }
        Insert: {
          creado_en?: string | null
          email: string
          id: string
          nombre: string
        }
        Update: {
          creado_en?: string | null
          email?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aportar_meta: {
        Args: { meta_id: string; monto: number }
        Returns: {
          completada: boolean
          creado_en: string | null
          fecha_limite: string | null
          id: string
          monto_actual: number
          monto_objetivo: number
          nombre: string
          usuario_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "metas"
          isOneToOne: false
          isSetofReturn: true
        }
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
    Enums: {},
  },
} as const
