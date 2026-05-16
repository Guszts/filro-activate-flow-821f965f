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
      admin_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          plan_id: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["admin_task_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["admin_task_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          plan_id?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["admin_task_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      extra_charges: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string
          description: string
          environment: string
          id: string
          paid_at: string | null
          payment_link: string | null
          project_id: string | null
          status: Database["public"]["Enums"]["extra_charge_status"]
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          environment?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["extra_charge_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string
          environment?: string
          id?: string
          paid_at?: string | null
          payment_link?: string | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["extra_charge_status"]
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_charges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      flaro_rate_limits: {
        Row: {
          created_at: string
          id: string
          identity: string
        }
        Insert: {
          created_at?: string
          id?: string
          identity: string
        }
        Update: {
          created_at?: string
          id?: string
          identity?: string
        }
        Relationships: []
      }
      partner_commissions: {
        Row: {
          activation_amount: number
          approved_at: string | null
          available_at: string | null
          base_amount: number
          cancellation_reason: string | null
          cancelled_at: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          id: string
          monthly_amount: number
          notes: string | null
          paid_at: string | null
          partner_id: string
          payment_id: string | null
          payout_id: string | null
          plan_id: string | null
          referral_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activation_amount?: number
          approved_at?: string | null
          available_at?: string | null
          base_amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          monthly_amount?: number
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          payment_id?: string | null
          payout_id?: string | null
          plan_id?: string | null
          referral_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activation_amount?: number
          approved_at?: string | null
          available_at?: string | null
          base_amount?: number
          cancellation_reason?: string | null
          cancelled_at?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          id?: string
          monthly_amount?: number
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          payment_id?: string | null
          payout_id?: string | null
          plan_id?: string | null
          referral_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "partner_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          pix_key: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          pix_key?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          pix_key?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_referrals: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          client_email: string | null
          client_name: string | null
          client_whatsapp: string | null
          converted_at: string | null
          created_at: string
          id: string
          landing_url: string | null
          partner_code: string | null
          partner_id: string
          plan_id: string | null
          source_url: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          user_id: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email?: string | null
          client_name?: string | null
          client_whatsapp?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          landing_url?: string | null
          partner_code?: string | null
          partner_id: string
          plan_id?: string | null
          source_url?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          user_id?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          client_email?: string | null
          client_name?: string | null
          client_whatsapp?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          landing_url?: string | null
          partner_code?: string | null
          partner_id?: string
          plan_id?: string | null
          source_url?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_referrals_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_referrals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          code: string
          commission_rate: number
          commission_scope: string
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          pix_key: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          code: string
          commission_rate?: number
          commission_scope?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          pix_key?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          code?: string
          commission_rate?: number
          commission_scope?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          pix_key?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          id: string
          paid_at: string | null
          plan_id: string
          status: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          paid_at?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          activation_price: number
          active: boolean
          created_at: string
          description: string
          display_order: number
          features: Json
          hidden: boolean
          id: string
          monthly_price: number
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          activation_price: number
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          features?: Json
          hidden?: boolean
          id?: string
          monthly_price: number
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          activation_price?: number
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          features?: Json
          hidden?: boolean
          id?: string
          monthly_price?: number
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          avatar_url: string | null
          business_name: string | null
          business_segment: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
          whatsapp: string | null
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          business_name?: string | null
          business_segment?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
          whatsapp?: string | null
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          avatar_url?: string | null
          business_name?: string | null
          business_segment?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      project_revisions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          kind: Database["public"]["Enums"]["revision_kind"]
          message: string
          project_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["revision_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["revision_kind"]
          message: string
          project_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["revision_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["revision_kind"]
          message?: string
          project_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["revision_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_revisions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["project_status"] | null
          id: string
          note: string | null
          project_id: string
          to_status: Database["public"]["Enums"]["project_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["project_status"] | null
          id?: string
          note?: string | null
          project_id: string
          to_status: Database["public"]["Enums"]["project_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["project_status"] | null
          id?: string
          note?: string | null
          project_id?: string
          to_status?: Database["public"]["Enums"]["project_status"]
        }
        Relationships: [
          {
            foreignKeyName: "project_status_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          assigned_admin_id: string | null
          business_info: Json | null
          business_info_submitted: boolean
          business_name: string | null
          business_segment: string | null
          created_at: string
          expected_delivery_at: string | null
          id: string
          kanban_position: number
          notes: string | null
          plan_id: string | null
          preview_url: string | null
          project_status: Database["public"]["Enums"]["project_status"]
          published_at: string | null
          published_url: string | null
          selected_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin_id?: string | null
          business_info?: Json | null
          business_info_submitted?: boolean
          business_name?: string | null
          business_segment?: string | null
          created_at?: string
          expected_delivery_at?: string | null
          id?: string
          kanban_position?: number
          notes?: string | null
          plan_id?: string | null
          preview_url?: string | null
          project_status?: Database["public"]["Enums"]["project_status"]
          published_at?: string | null
          published_url?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin_id?: string | null
          business_info?: Json | null
          business_info_submitted?: boolean
          business_name?: string | null
          business_segment?: string | null
          created_at?: string
          expected_delivery_at?: string | null
          id?: string
          kanban_position?: number
          notes?: string | null
          plan_id?: string | null
          preview_url?: string | null
          project_status?: Database["public"]["Enums"]["project_status"]
          published_at?: string | null
          published_url?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          plan_id: string | null
          price_id: string | null
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan_id?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          plan_id?: string | null
          price_id?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_id: string
          author_role: string
          content: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_role: string
          content: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_role?: string
          content?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          initial_message: string
          kind: Database["public"]["Enums"]["ticket_kind"]
          last_admin_reply_at: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          initial_message: string
          kind?: Database["public"]["Enums"]["ticket_kind"]
          last_admin_reply_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          initial_message?: string
          kind?: Database["public"]["Enums"]["ticket_kind"]
          last_admin_reply_at?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          environment: string
          event_id: string
          event_type: string
          processed_at: string
        }
        Insert: {
          environment: string
          event_id: string
          event_type: string
          processed_at?: string
        }
        Update: {
          environment?: string
          event_id?: string
          event_type?: string
          processed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      pay_partner_commission: {
        Args: { _commission_id: string; _method?: string; _notes?: string }
        Returns: string
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      account_type: "customer" | "admin"
      admin_task_status: "pending" | "in_progress" | "done" | "canceled"
      app_role: "admin" | "customer"
      extra_charge_status: "draft" | "sent" | "paid" | "cancelled" | "refunded"
      payment_status:
        | "pending"
        | "processing"
        | "paid"
        | "failed"
        | "refunded"
        | "cancelled"
      project_status:
        | "new"
        | "paid"
        | "waiting_info"
        | "in_production"
        | "delivered"
        | "on_hold"
        | "cancelled"
        | "payment_confirmed"
        | "briefing_received"
        | "revision_sent"
        | "awaiting_client"
        | "published"
        | "maintenance"
        | "paused"
      revision_kind:
        | "client_request"
        | "admin_update"
        | "approval"
        | "publish_note"
      revision_status: "open" | "in_progress" | "resolved"
      ticket_kind:
        | "question"
        | "change_request"
        | "bug"
        | "cancellation"
        | "other"
      ticket_priority: "low" | "normal" | "high" | "urgent"
      ticket_status:
        | "open"
        | "in_progress"
        | "waiting_client"
        | "resolved"
        | "closed"
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
      account_type: ["customer", "admin"],
      admin_task_status: ["pending", "in_progress", "done", "canceled"],
      app_role: ["admin", "customer"],
      extra_charge_status: ["draft", "sent", "paid", "cancelled", "refunded"],
      payment_status: [
        "pending",
        "processing",
        "paid",
        "failed",
        "refunded",
        "cancelled",
      ],
      project_status: [
        "new",
        "paid",
        "waiting_info",
        "in_production",
        "delivered",
        "on_hold",
        "cancelled",
        "payment_confirmed",
        "briefing_received",
        "revision_sent",
        "awaiting_client",
        "published",
        "maintenance",
        "paused",
      ],
      revision_kind: [
        "client_request",
        "admin_update",
        "approval",
        "publish_note",
      ],
      revision_status: ["open", "in_progress", "resolved"],
      ticket_kind: [
        "question",
        "change_request",
        "bug",
        "cancellation",
        "other",
      ],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: [
        "open",
        "in_progress",
        "waiting_client",
        "resolved",
        "closed",
      ],
    },
  },
} as const
