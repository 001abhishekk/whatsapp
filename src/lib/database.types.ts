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
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          logo_url: string | null
          description: string | null
          whatsapp_phone_number_id: string | null
          whatsapp_business_account_id: string | null
          whatsapp_access_token: string | null
          webhook_verify_token: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          logo_url?: string | null
          description?: string | null
          whatsapp_phone_number_id?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_access_token?: string | null
          webhook_verify_token?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          logo_url?: string | null
          description?: string | null
          whatsapp_phone_number_id?: string | null
          whatsapp_business_account_id?: string | null
          whatsapp_access_token?: string | null
          webhook_verify_token?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          business_id: string
          phone: string
          name: string | null
          profile_pic_url: string | null
          tags: string[]
          notes: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          phone: string
          name?: string | null
          profile_pic_url?: string | null
          tags?: string[]
          notes?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          phone?: string
          name?: string | null
          profile_pic_url?: string | null
          tags?: string[]
          notes?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          business_id: string
          contact_id: string
          assigned_to: string | null
          status: string
          last_message_at: string
          unread_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          contact_id: string
          assigned_to?: string | null
          status?: string
          last_message_at?: string
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          contact_id?: string
          assigned_to?: string | null
          status?: string
          last_message_at?: string
          unread_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          business_id: string
          conversation_id: string
          contact_id: string
          whatsapp_message_id: string | null
          direction: string
          type: string
          content: string | null
          media_url: string | null
          media_mime_type: string | null
          status: string
          sent_by: string | null
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          conversation_id: string
          contact_id: string
          whatsapp_message_id?: string | null
          direction: string
          type?: string
          content?: string | null
          media_url?: string | null
          media_mime_type?: string | null
          status?: string
          sent_by?: string | null
          timestamp?: string
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          conversation_id?: string
          contact_id?: string
          whatsapp_message_id?: string | null
          direction?: string
          type?: string
          content?: string | null
          media_url?: string | null
          media_mime_type?: string | null
          status?: string
          sent_by?: string | null
          timestamp?: string
          created_at?: string
        }
      }
      message_templates: {
        Row: {
          id: string
          business_id: string
          template_id: string | null
          name: string
          language: string
          category: string
          status: string
          header_type: string
          header_content: string | null
          body_content: string
          footer_content: string | null
          buttons: Json
          variables: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          template_id?: string | null
          name: string
          language?: string
          category?: string
          status?: string
          header_type?: string
          header_content?: string | null
          body_content: string
          footer_content?: string | null
          buttons?: Json
          variables?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          template_id?: string | null
          name?: string
          language?: string
          category?: string
          status?: string
          header_type?: string
          header_content?: string | null
          body_content?: string
          footer_content?: string | null
          buttons?: Json
          variables?: Json
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          business_id: string
          name: string
          template_id: string | null
          target_contacts: string[] | null
          target_tags: string[] | null
          status: string
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          total_recipients: number
          sent_count: number
          delivered_count: number
          read_count: number
          failed_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          template_id?: string | null
          target_contacts?: string[] | null
          target_tags?: string[] | null
          status?: string
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          total_recipients?: number
          sent_count?: number
          delivered_count?: number
          read_count?: number
          failed_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          template_id?: string | null
          target_contacts?: string[] | null
          target_tags?: string[] | null
          status?: string
          scheduled_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          total_recipients?: number
          sent_count?: number
          delivered_count?: number
          read_count?: number
          failed_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      automation_rules: {
        Row: {
          id: string
          business_id: string
          name: string
          trigger_type: string
          trigger_value: string | null
          is_active: boolean
          response_type: string
          response_content: string | null
          response_data: Json | null
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          trigger_type: string
          trigger_value?: string | null
          is_active?: boolean
          response_type: string
          response_content?: string | null
          response_data?: Json | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          trigger_type?: string
          trigger_value?: string | null
          is_active?: boolean
          response_type?: string
          response_content?: string | null
          response_data?: Json | null
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      conversation_notes: {
        Row: {
          id: string
          conversation_id: string
          created_by: string
          note: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          created_by: string
          note: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          created_by?: string
          note?: string
          created_at?: string
        }
      }
    }
  }
}
