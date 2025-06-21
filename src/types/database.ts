export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      encrypted_tokens: {
        Row: {
          user_id: string
          encrypted_data: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          encrypted_data: string
          expires_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          encrypted_data?: string
          expires_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      battles: {
        Row: {
          id: string
          user_id: string
          battle_data: Json
          played_at: string
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          battle_data: Json
          played_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          battle_data?: Json
          played_at?: string
          created_at?: string
        }
      }
      ai_analyses: {
        Row: {
          id: string
          battle_id: string | null
          user_id: string
          analysis_type: string
          result: Json
          model_used: string
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          battle_id?: string | null
          user_id: string
          analysis_type: string
          result: Json
          model_used: string
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          battle_id?: string | null
          user_id?: string
          analysis_type?: string
          result?: Json
          model_used?: string
          tokens_used?: number | null
          created_at?: string
        }
      }
      user_stats_cache: {
        Row: {
          user_id: string
          stats_data: Json
          last_battle_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          stats_data: Json
          last_battle_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          stats_data?: Json
          last_battle_at?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}