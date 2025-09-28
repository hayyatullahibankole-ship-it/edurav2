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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          answer: Json | null
          answered_at: string | null
          attempt_id: string | null
          id: string
          is_correct: boolean | null
          is_flagged: boolean | null
          question_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          answer?: Json | null
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          question_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          answer?: Json | null
          answered_at?: string | null
          attempt_id?: string | null
          id?: string
          is_correct?: boolean | null
          is_flagged?: boolean | null
          question_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          created_at: string | null
          device_fingerprint: string | null
          exam_id: string | null
          id: string
          ip_address: unknown | null
          proctoring_data: Json | null
          selected_subjects: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["attempt_status"] | null
          submitted_at: string | null
          suspicious_activity_count: number | null
          time_remaining_seconds: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_fingerprint?: string | null
          exam_id?: string | null
          id?: string
          ip_address?: unknown | null
          proctoring_data?: Json | null
          selected_subjects?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"] | null
          submitted_at?: string | null
          suspicious_activity_count?: number | null
          time_remaining_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_fingerprint?: string | null
          exam_id?: string | null
          id?: string
          ip_address?: unknown | null
          proctoring_data?: Json | null
          selected_subjects?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["attempt_status"] | null
          submitted_at?: string | null
          suspicious_activity_count?: number | null
          time_remaining_seconds?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string
          actor_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: Json | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: Json | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: Json | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_paid: boolean | null
          meeting_link: string | null
          notes: string | null
          payment_reference: string | null
          price: number | null
          start_time: string
          status: Database["public"]["Enums"]["booking_status"] | null
          subject_id: string | null
          title: string | null
          tutor_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_paid?: boolean | null
          meeting_link?: string | null
          notes?: string | null
          payment_reference?: string | null
          price?: number | null
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          subject_id?: string | null
          title?: string | null
          tutor_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_paid?: boolean | null
          meeting_link?: string | null
          notes?: string | null
          payment_reference?: string | null
          price?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          subject_id?: string | null
          title?: string | null
          tutor_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_subjects: {
        Row: {
          display_order: number | null
          exam_id: string | null
          id: string
          is_mandatory: boolean | null
          question_count: number
          subject_id: string | null
          subject_name: string
          time_allocation_minutes: number | null
        }
        Insert: {
          display_order?: number | null
          exam_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          question_count: number
          subject_id?: string | null
          subject_name: string
          time_allocation_minutes?: number | null
        }
        Update: {
          display_order?: number | null
          exam_id?: string | null
          id?: string
          is_mandatory?: boolean | null
          question_count?: number
          subject_id?: string | null
          subject_name?: string
          time_allocation_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_subjects_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          instructions: string | null
          is_published: boolean | null
          passing_score: number | null
          requires_subscription: boolean | null
          subscription_level: string | null
          title: string
          total_questions: number | null
          type: Database["public"]["Enums"]["exam_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          passing_score?: number | null
          requires_subscription?: boolean | null
          subscription_level?: string | null
          title: string
          total_questions?: number | null
          type: Database["public"]["Enums"]["exam_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          passing_score?: number | null
          requires_subscription?: boolean | null
          subscription_level?: string | null
          title?: string
          total_questions?: number | null
          type?: Database["public"]["Enums"]["exam_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: Json
          created_at: string | null
          created_by: string | null
          difficulty_level: number | null
          explanation: string | null
          id: string
          is_active: boolean | null
          media_urls: Json | null
          options: Json | null
          points: number | null
          question_text: string
          subject_id: string | null
          tags: Json | null
          time_limit_seconds: number | null
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string | null
        }
        Insert: {
          correct_answer: Json
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          media_urls?: Json | null
          options?: Json | null
          points?: number | null
          question_text: string
          subject_id?: string | null
          tags?: Json | null
          time_limit_seconds?: number | null
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Update: {
          correct_answer?: Json
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: number | null
          explanation?: string | null
          id?: string
          is_active?: boolean | null
          media_urls?: Json | null
          options?: Json | null
          points?: number | null
          question_text?: string
          subject_id?: string | null
          tags?: Json | null
          time_limit_seconds?: number | null
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          endpoint?: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          access_level: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean | null
          subject_id: string | null
          tags: Json | null
          title: string
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          tags?: Json | null
          title: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          tags?: Json | null
          title?: string
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      results: {
        Row: {
          attempt_id: string | null
          auto_graded: boolean | null
          correct_answers: number
          created_at: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          percentage: number | null
          percentile_rank: number | null
          raw_score: number
          scaled_score: number | null
          subject_breakdown: Json | null
          time_taken_minutes: number | null
          total_questions: number
          unanswered: number
          wrong_answers: number
        }
        Insert: {
          attempt_id?: string | null
          auto_graded?: boolean | null
          correct_answers?: number
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          percentage?: number | null
          percentile_rank?: number | null
          raw_score?: number
          scaled_score?: number | null
          subject_breakdown?: Json | null
          time_taken_minutes?: number | null
          total_questions: number
          unanswered?: number
          wrong_answers?: number
        }
        Update: {
          attempt_id?: string | null
          auto_graded?: boolean | null
          correct_answers?: number
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          percentage?: number | null
          percentile_rank?: number | null
          raw_score?: number
          scaled_score?: number | null
          subject_breakdown?: Json | null
          time_taken_minutes?: number | null
          total_questions?: number
          unanswered?: number
          wrong_answers?: number
        }
        Relationships: [
          {
            foreignKeyName: "results_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "results_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          permissions: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string | null
          default_question_count: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          default_question_count?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string | null
          default_question_count?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          is_active: boolean | null
          max_attempts: number | null
          name: string
          price: number
          resource_access_level: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          name: string
          price?: number
          resource_access_level?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_attempts?: number | null
          name?: string
          price?: number
          resource_access_level?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          id: string
          payment_reference: string | null
          plan_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_reference?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          payment_reference?: string | null
          plan_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          gateway: string | null
          gateway_reference: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          gateway?: string | null
          gateway_reference?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          auth_user_id: string | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          device_fingerprint: string | null
          email: string
          first_name: string | null
          id: string
          is_suspended: boolean | null
          is_verified: boolean | null
          last_login_at: string | null
          last_login_ip: unknown | null
          last_name: string | null
          phone: string | null
          profile_image_url: string | null
          state: string | null
          two_fa_enabled: boolean | null
          two_fa_secret: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          auth_user_id?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          device_fingerprint?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          last_name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          two_fa_enabled?: boolean | null
          two_fa_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          auth_user_id?: string | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          device_fingerprint?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_login_at?: string | null
          last_login_ip?: unknown | null
          last_name?: string | null
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          two_fa_enabled?: boolean | null
          two_fa_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_full_pii: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          endpoint_name: string
          max_requests?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      delete_user_completely: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_exam_questions: {
        Args: { exam_question_ids: string[] }
        Returns: {
          difficulty_level: number
          id: string
          media_urls: Json
          options: Json
          points: number
          question_text: string
          subject_id: string
          tags: Json
          time_limit_seconds: number
          type: Database["public"]["Enums"]["question_type"]
        }[]
      }
      get_exam_questions_secure: {
        Args: { exam_question_ids: string[] }
        Returns: {
          difficulty_level: number
          id: string
          media_urls: Json
          options: Json
          points: number
          question_text: string
          subject_id: string
          tags: Json
          time_limit_seconds: number
          type: Database["public"]["Enums"]["question_type"]
        }[]
      }
      get_question_explanation: {
        Args: { question_id: string; user_id: string }
        Returns: string
      }
      get_subject_question_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          question_count: number
          subject_id: string
        }[]
      }
      get_user_safe_data: {
        Args: { target_user_id: string }
        Returns: {
          address: string
          auth_user_id: string
          country: string
          created_at: string
          date_of_birth: string
          email: string
          first_name: string
          id: string
          is_suspended: boolean
          is_verified: boolean
          last_name: string
          phone: string
          profile_image_url: string
          state: string
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      log_admin_action: {
        Args: { action_type: string; admin_id: string; target_id?: string }
        Returns: boolean
      }
      log_admin_pii_access: {
        Args: {
          access_type: string
          accessed_fields?: string[]
          target_user_id: string
        }
        Returns: undefined
      }
      log_pii_access: {
        Args: { access_type: string; accessed_user_id: string }
        Returns: undefined
      }
      log_security_event: {
        Args: {
          details?: Json
          event_type: string
          target_id?: string
          target_table: string
        }
        Returns: undefined
      }
      mask_email: {
        Args: { email: string }
        Returns: string
      }
      mask_phone: {
        Args: { phone: string }
        Returns: string
      }
      validate_question_answer: {
        Args: { question_id: string; submitted_answer: Json }
        Returns: boolean
      }
      validate_user_input: {
        Args: { input_data: Json; validation_rules: Json }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "tutor" | "student"
      attempt_status:
        | "STARTED"
        | "IN_PROGRESS"
        | "SUBMITTED"
        | "GRADED"
        | "SUSPENDED"
      booking_status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
      exam_type: "JAMB" | "WAEC" | "CUSTOM"
      question_type:
        | "MCQ_SINGLE"
        | "MCQ_MULTI"
        | "TRUE_FALSE"
        | "FILL_IN"
        | "MATCHING"
        | "ESSAY"
      subscription_status: "ACTIVE" | "EXPIRED" | "CANCELLED" | "TRIAL"
      transaction_status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
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
      app_role: ["super_admin", "admin", "tutor", "student"],
      attempt_status: [
        "STARTED",
        "IN_PROGRESS",
        "SUBMITTED",
        "GRADED",
        "SUSPENDED",
      ],
      booking_status: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
      exam_type: ["JAMB", "WAEC", "CUSTOM"],
      question_type: [
        "MCQ_SINGLE",
        "MCQ_MULTI",
        "TRUE_FALSE",
        "FILL_IN",
        "MATCHING",
        "ESSAY",
      ],
      subscription_status: ["ACTIVE", "EXPIRED", "CANCELLED", "TRIAL"],
      transaction_status: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    },
  },
} as const
