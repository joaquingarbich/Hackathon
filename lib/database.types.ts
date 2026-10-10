// Generado desde Supabase (MCP generate_typescript_types). No editar a mano: regenerar tras cada migración.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      authorizations: {
        Row: {
          entidad_emisora: string
          fecha_emision: string | null
          fecha_vencimiento: string | null
          id: string
          numero: string | null
          provider_id: string
          source_id: string
          tipo: string
        }
        Insert: {
          entidad_emisora: string
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          id?: string
          numero?: string | null
          provider_id: string
          source_id: string
          tipo: string
        }
        Update: {
          entidad_emisora?: string
          fecha_emision?: string | null
          fecha_vencimiento?: string | null
          id?: string
          numero?: string | null
          provider_id?: string
          source_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "authorizations_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorizations_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      limites: {
        Row: { clave: string; n: number; ventana: string }
        Insert: { clave: string; n?: number; ventana: string }
        Update: { clave?: string; n?: number; ventana?: string }
        Relationships: []
      }
      lookups: {
        Row: {
          created_at: string
          entrada_normalizada: string | null
          estado_resultado: string | null
          id: number
          provider_id: string | null
          tipo_entrada: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          entrada_normalizada?: string | null
          estado_resultado?: string | null
          id?: never
          provider_id?: string | null
          tipo_entrada: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          entrada_normalizada?: string | null
          estado_resultado?: string | null
          id?: never
          provider_id?: string | null
          tipo_entrada?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lookups_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lookups_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedor_cambios: {
        Row: { created_at: string; datos: Json; estado: string; id: string; motivo: string | null; provider_id: string; revisado_at: string | null; revisor: string | null; user_id: string }
        Insert: { created_at?: string; datos: Json; estado?: string; id?: string; motivo?: string | null; provider_id: string; revisado_at?: string | null; revisor?: string | null; user_id: string }
        Update: { created_at?: string; datos?: Json; estado?: string; id?: string; motivo?: string | null; provider_id?: string; revisado_at?: string | null; revisor?: string | null; user_id?: string }
        Relationships: []
      }
      proveedor_cuentas: {
        Row: { created_at: string; provider_id: string; user_id: string }
        Insert: { created_at?: string; provider_id: string; user_id: string }
        Update: { created_at?: string; provider_id?: string; user_id?: string }
        Relationships: []
      }
      providers: {
        Row: {
          actividades: string[]
          clases: string[]
          correo: string | null
          descripcion: string | null
          direccion: string | null
          distrito: string | null
          es_muestra: boolean
          estado_inscripcion: string
          id: string
          modalidad: string | null
          nombre_comercial: string | null
          nombre_normalizado: string | null
          provincia: string | null
          razon_social: string | null
          redes: Json
          ruc: string | null
          source_id: string
          telefono: string | null
          tipo: string
          validacion_vence: string | null
          web: string | null
        }
        Insert: {
          actividades?: string[]
          clases?: string[]
          correo?: string | null
          descripcion?: string | null
          direccion?: string | null
          distrito?: string | null
          es_muestra?: boolean
          estado_inscripcion?: string
          id?: string
          modalidad?: string | null
          nombre_comercial?: string | null
          nombre_normalizado?: string | null
          provincia?: string | null
          razon_social?: string | null
          redes?: Json
          ruc?: string | null
          source_id: string
          telefono?: string | null
          tipo: string
          validacion_vence?: string | null
          web?: string | null
        }
        Update: {
          actividades?: string[]
          clases?: string[]
          correo?: string | null
          descripcion?: string | null
          direccion?: string | null
          distrito?: string | null
          es_muestra?: boolean
          estado_inscripcion?: string
          id?: string
          modalidad?: string | null
          nombre_comercial?: string | null
          nombre_normalizado?: string | null
          provincia?: string | null
          razon_social?: string | null
          redes?: Json
          ruc?: string | null
          source_id?: string
          telefono?: string | null
          tipo?: string
          validacion_vence?: string | null
          web?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      review_contactos: {
        Row: {
          celular: string
          consentimiento_at: string
          correo: string
          nombre: string
          review_id: string
        }
        Insert: {
          celular: string
          consentimiento_at?: string
          correo: string
          nombre: string
          review_id: string
        }
        Update: {
          celular?: string
          consentimiento_at?: string
          correo?: string
          nombre?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_contactos_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: true
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          alias: string | null
          comentario: string | null
          comprobante_fecha: string | null
          comprobante_path: string | null
          comprobante_ruc: string | null
          comprobante_serie: string | null
          created_at: string
          device_hash: string
          estado: string
          estrellas: number
          fecha_servicio: string | null
          id: string
          motivo: string | null
          provider_id: string
          respuesta_prestador: string | null
          revisado_at: string | null
          revisor: string | null
          servicio: string | null
          verificacion: Json | null
          verificado: boolean
        }
        Insert: {
          alias?: string | null
          comentario?: string | null
          comprobante_fecha?: string | null
          comprobante_path?: string | null
          comprobante_ruc?: string | null
          comprobante_serie?: string | null
          created_at?: string
          device_hash: string
          estado?: string
          estrellas: number
          fecha_servicio?: string | null
          id?: string
          motivo?: string | null
          provider_id: string
          respuesta_prestador?: string | null
          revisado_at?: string | null
          revisor?: string | null
          servicio?: string | null
          verificacion?: Json | null
          verificado?: boolean
        }
        Update: {
          alias?: string | null
          comentario?: string | null
          comprobante_fecha?: string | null
          comprobante_path?: string | null
          comprobante_ruc?: string | null
          comprobante_serie?: string | null
          created_at?: string
          device_hash?: string
          estado?: string
          estrellas?: number
          fecha_servicio?: string | null
          id?: string
          motivo?: string | null
          provider_id?: string
          respuesta_prestador?: string | null
          revisado_at?: string | null
          revisor?: string | null
          servicio?: string | null
          verificacion?: Json | null
          verificado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ruc_status: {
        Row: {
          condicion: string
          estado: string
          razon_social: string
          ruc: string
          source_id: string
          ubigeo: string | null
        }
        Insert: {
          condicion: string
          estado: string
          razon_social: string
          ruc: string
          source_id: string
          ubigeo?: string | null
        }
        Update: {
          condicion?: string
          estado?: string
          razon_social?: string
          ruc?: string
          source_id?: string
          ubigeo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ruc_status_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      // AÑADIDO A MANO desde supabase/migrations/20261011000000_catalogo_servicios.sql (aún no aplicada).
      // Regenerar este archivo con el MCP después de aplicar la migración.
      services: {
        Row: {
          categoria: string
          condiciones: string | null
          created_at: string
          descripcion: string | null
          destino: string
          duracion: string | null
          es_muestra: boolean
          estado: string
          fotos: string[]
          grupo_max: number | null
          id: string
          idiomas: string[]
          ilustracion: string | null
          motivo: string | null
          incluye: string[]
          itinerario: Json
          no_incluye: string[]
          nombre: string
          precio_ref: number | null
          provider_id: string
          punto_encuentro: string | null
          revisado_at: string | null
          revisor: string | null
          salidas: string | null
          temporada: string | null
          unidad_precio: string
        }
        Insert: {
          categoria: string
          condiciones?: string | null
          created_at?: string
          descripcion?: string | null
          destino: string
          duracion?: string | null
          es_muestra?: boolean
          estado?: string
          fotos?: string[]
          grupo_max?: number | null
          id?: string
          idiomas?: string[]
          ilustracion?: string | null
          motivo?: string | null
          incluye?: string[]
          itinerario?: Json
          no_incluye?: string[]
          nombre: string
          precio_ref?: number | null
          provider_id: string
          punto_encuentro?: string | null
          revisado_at?: string | null
          revisor?: string | null
          salidas?: string | null
          temporada?: string | null
          unidad_precio?: string
        }
        Update: {
          categoria?: string
          condiciones?: string | null
          created_at?: string
          descripcion?: string | null
          destino?: string
          duracion?: string | null
          es_muestra?: boolean
          estado?: string
          fotos?: string[]
          grupo_max?: number | null
          id?: string
          idiomas?: string[]
          ilustracion?: string | null
          motivo?: string | null
          incluye?: string[]
          itinerario?: Json
          no_incluye?: string[]
          nombre?: string
          precio_ref?: number | null
          provider_id?: string
          punto_encuentro?: string | null
          revisado_at?: string | null
          revisor?: string | null
          salidas?: string | null
          temporada?: string | null
          unidad_precio?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          fecha_corte: string
          id: string
          n_registros: number | null
          nombre: string
          url: string | null
        }
        Insert: {
          fecha_corte: string
          id: string
          n_registros?: number | null
          nombre: string
          url?: string | null
        }
        Update: {
          fecha_corte?: string
          id?: string
          n_registros?: number | null
          nombre?: string
          url?: string | null
        }
        Relationships: []
      }
      submissions: {
        Row: {
          archivo_path: string
          campos_extraidos: Json | null
          confianza: string | null
          created_at: string
          datos_declarados: Json
          estado: string
          hash: string | null
          id: string
          motivo: string | null
          resultado_capas: Json | null
          revisado_at: string | null
          revisor: string | null
          ruc: string
          tipo_documento: string
          user_id: string
          vence_el: string | null
        }
        Insert: {
          archivo_path: string
          campos_extraidos?: Json | null
          confianza?: string | null
          created_at?: string
          datos_declarados?: Json
          estado?: string
          hash?: string | null
          id?: string
          motivo?: string | null
          resultado_capas?: Json | null
          revisado_at?: string | null
          revisor?: string | null
          ruc: string
          tipo_documento: string
          user_id?: string
          vence_el?: string | null
        }
        Update: {
          archivo_path?: string
          campos_extraidos?: Json | null
          confianza?: string | null
          created_at?: string
          datos_declarados?: Json
          estado?: string
          hash?: string | null
          id?: string
          motivo?: string | null
          resultado_capas?: Json | null
          revisado_at?: string | null
          revisor?: string | null
          ruc?: string
          tipo_documento?: string
          user_id?: string
          vence_el?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          ambito: string | null
          citv_vencimiento: string | null
          es_muestra: boolean
          estado: string
          habilitacion_vencimiento: string | null
          id: string
          modalidad: string
          placa: string
          provider_id: string
          soat_vencimiento: string | null
          source_id: string
          tuc_numero: string | null
        }
        Insert: {
          ambito?: string | null
          citv_vencimiento?: string | null
          es_muestra?: boolean
          estado?: string
          habilitacion_vencimiento?: string | null
          id?: string
          modalidad: string
          placa: string
          provider_id: string
          soat_vencimiento?: string | null
          source_id: string
          tuc_numero?: string | null
        }
        Update: {
          ambito?: string | null
          citv_vencimiento?: string | null
          es_muestra?: boolean
          estado?: string
          habilitacion_vencimiento?: string | null
          id?: string
          modalidad?: string
          placa?: string
          provider_id?: string
          soat_vencimiento?: string | null
          source_id?: string
          tuc_numero?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_prestadores: {
        Args: { limite?: number; q: string; umbral?: number }
        Returns: {
          id: string
          nombre_comercial: string
          razon_social: string
          ruc: string
          similitud: number
          tipo: string
        }[]
      }
      buscar_por_contacto: {
        Args: { telefono?: string; usuario?: string }
        Returns: { id: string }[]
      }
      consumir_cupo: { Args: { p_clave: string; p_ventana_seg: number }; Returns: number }
      es_admin: { Args: never; Returns: boolean }
      normalizar_nombre: { Args: { t: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
