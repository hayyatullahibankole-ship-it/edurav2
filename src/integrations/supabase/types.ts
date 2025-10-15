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
      achievements: {
        Row: {
          badge_color: string | null
          badge_icon: string | null
          category: string | null
          created_at: string | null
          criteria: Json
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          points_value: number | null
        }
        Insert: {
          badge_color?: string | null
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          criteria: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_value?: number | null
        }
        Update: {
          badge_color?: string | null
          badge_icon?: string | null
          category?: string | null
          created_at?: string | null
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_value?: number | null
        }
        Relationships: []
      }
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
      challenge_attempts: {
        Row: {
          challenge_id: string
          completed_at: string | null
          correct_answers: number | null
          id: string
          points_earned: number | null
          score: number | null
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          points_earned?: number | null
          score?: number | null
          time_taken_seconds: number
          total_questions: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          correct_answers?: number | null
          id?: string
          points_earned?: number | null
          score?: number | null
          time_taken_seconds?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_attempts_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string | null
          course_category: Database["public"]["Enums"]["course_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          duration_minutes: number
          end_date: string
          id: string
          is_active: boolean | null
          points_reward: number | null
          question_count: number
          start_date: string
          subject_ids: Json
          title: string
        }
        Insert: {
          challenge_type?: string | null
          course_category?: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_minutes?: number
          end_date: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          question_count?: number
          start_date: string
          subject_ids?: Json
          title: string
        }
        Update: {
          challenge_type?: string | null
          course_category?: Database["public"]["Enums"]["course_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          duration_minutes?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          points_reward?: number | null
          question_count?: number
          start_date?: string
          subject_ids?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_delivery_log: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          provider_message_id: string | null
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_email: string
          sent_at?: string | null
          status: string
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          provider_message_id?: string | null
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_delivery_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          created_at: string
          id: string
          marketing_emails: boolean
          product_updates: boolean
          subscription_reminders: boolean
          unsubscribe_token: string
          updated_at: string
          user_id: string
          welcome_emails: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          marketing_emails?: boolean
          product_updates?: boolean
          subscription_reminders?: boolean
          unsubscribe_token?: string
          updated_at?: string
          user_id: string
          welcome_emails?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          marketing_emails?: boolean
          product_updates?: boolean
          subscription_reminders?: boolean
          unsubscribe_token?: string
          updated_at?: string
          user_id?: string
          welcome_emails?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "email_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      forum_posts: {
        Row: {
          content: string
          created_at: string | null
          exam_type: Database["public"]["Enums"]["exam_type"] | null
          id: string
          images: Json | null
          is_featured: boolean | null
          is_pinned: boolean | null
          is_solved: boolean | null
          reply_count: number | null
          solved_at: string | null
          subject_id: string | null
          title: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"] | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          is_solved?: boolean | null
          reply_count?: number | null
          solved_at?: string | null
          subject_id?: string | null
          title: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          exam_type?: Database["public"]["Enums"]["exam_type"] | null
          id?: string
          images?: Json | null
          is_featured?: boolean | null
          is_pinned?: boolean | null
          is_solved?: boolean | null
          reply_count?: number | null
          solved_at?: string | null
          subject_id?: string | null
          title?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string | null
          id: string
          images: Json | null
          is_answer: boolean | null
          post_id: string
          updated_at: string | null
          upvotes: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          images?: Json | null
          is_answer?: boolean | null
          post_id: string
          updated_at?: string | null
          upvotes?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          images?: Json | null
          is_answer?: boolean | null
          post_id?: string
          updated_at?: string | null
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          completed_at: string
          created_at: string | null
          id: string
          lesson_id: string
          quiz_percentage: number | null
          quiz_score: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string | null
          id?: string
          lesson_id: string
          quiz_percentage?: number | null
          quiz_score?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          quiz_percentage?: number | null
          quiz_score?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "study_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_questions: {
        Row: {
          display_order: number | null
          id: string
          lesson_id: string
          question_id: string
        }
        Insert: {
          display_order?: number | null
          id?: string
          lesson_id: string
          question_id: string
        }
        Update: {
          display_order?: number | null
          id?: string
          lesson_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "study_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          success: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          success?: boolean
        }
        Relationships: []
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
          correct_answer: string
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
          correct_answer: string
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
          correct_answer?: string
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
          details: Json | null
          endpoint: string
          id: string
          request_count: number | null
          user_id: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          endpoint: string
          id?: string
          request_count?: number | null
          user_id?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
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
            isOneToOne: true
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
      school_staff: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permissions: Json | null
          role: string | null
          school_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          school_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: Json | null
          role?: string | null
          school_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_staff_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_staff_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      school_students: {
        Row: {
          class_level: string | null
          created_at: string | null
          enrollment_date: string | null
          id: string
          is_active: boolean | null
          school_id: string
          student_id: string | null
          user_id: string
        }
        Insert: {
          class_level?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id: string
          student_id?: string | null
          user_id: string
        }
        Update: {
          class_level?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          id?: string
          is_active?: boolean | null
          school_id?: string
          student_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_students_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      school_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          end_date: string | null
          features: Json | null
          id: string
          payment_reference: string | null
          plan_id: string
          school_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          student_seats: number | null
          updated_at: string | null
          used_seats: number | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          payment_reference?: string | null
          plan_id: string
          school_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          student_seats?: number | null
          updated_at?: string | null
          used_seats?: number | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          end_date?: string | null
          features?: Json | null
          id?: string
          payment_reference?: string | null
          plan_id?: string
          school_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          student_seats?: number | null
          updated_at?: string | null
          used_seats?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "school_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_subscriptions_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          admin_user_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          email: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          max_students: number | null
          name: string
          phone: string | null
          registration_number: string | null
          slug: string
          state: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          admin_user_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_students?: number | null
          name: string
          phone?: string | null
          registration_number?: string | null
          slug: string
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          admin_user_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          max_students?: number | null
          name?: string
          phone?: string | null
          registration_number?: string | null
          slug?: string
          state?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schools_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      study_lessons: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          display_order: number | null
          estimated_minutes: number | null
          id: string
          is_active: boolean | null
          media_urls: Json | null
          summary: string | null
          title: string
          topic_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          media_urls?: Json | null
          summary?: string | null
          title: string
          topic_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          display_order?: number | null
          estimated_minutes?: number | null
          id?: string
          is_active?: boolean | null
          media_urls?: Json | null
          summary?: string | null
          title?: string
          topic_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_lessons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "study_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      study_resources: {
        Row: {
          created_at: string | null
          display_order: number | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          lesson_id: string
          resource_type: string
          resource_url: string
          title: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id: string
          resource_type: string
          resource_url: string
          title: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          lesson_id?: string
          resource_type?: string
          resource_url?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_resources_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "study_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      study_topics: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: number | null
          display_order: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id: string
          is_active: boolean | null
          subject_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          display_order?: number | null
          exam_type: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: number | null
          display_order?: number | null
          exam_type?: Database["public"]["Enums"]["exam_type"]
          id?: string
          is_active?: boolean | null
          subject_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          course_category: Database["public"]["Enums"]["course_category"] | null
          created_at: string | null
          default_question_count: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code?: string | null
          course_category?:
            | Database["public"]["Enums"]["course_category"]
            | null
          created_at?: string | null
          default_question_count?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string | null
          course_category?:
            | Database["public"]["Enums"]["course_category"]
            | null
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
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
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
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          id: string
          last_updated: string | null
          rank: number | null
          total_points: number | null
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          rank?: number | null
          total_points?: number | null
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          rank?: number | null
          total_points?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          data_collection_analytics: boolean
          data_collection_personalization: boolean
          default_exam_type: string
          difficulty_preference: string
          email_results: boolean
          email_study_tips: boolean
          email_subscription_updates: boolean
          email_test_reminders: boolean
          id: string
          language: string
          onboarding_completed: boolean
          onboarding_completed_at: string | null
          profile_visibility: string
          push_notifications: boolean
          show_study_progress: boolean
          show_test_scores: boolean
          sms_results: boolean
          sms_test_reminders: boolean
          test_duration_preference: string
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_collection_analytics?: boolean
          data_collection_personalization?: boolean
          default_exam_type?: string
          difficulty_preference?: string
          email_results?: boolean
          email_study_tips?: boolean
          email_subscription_updates?: boolean
          email_test_reminders?: boolean
          id?: string
          language?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          profile_visibility?: string
          push_notifications?: boolean
          show_study_progress?: boolean
          show_test_scores?: boolean
          sms_results?: boolean
          sms_test_reminders?: boolean
          test_duration_preference?: string
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_collection_analytics?: boolean
          data_collection_personalization?: boolean
          default_exam_type?: string
          difficulty_preference?: string
          email_results?: boolean
          email_study_tips?: boolean
          email_subscription_updates?: boolean
          email_test_reminders?: boolean
          id?: string
          language?: string
          onboarding_completed?: boolean
          onboarding_completed_at?: string | null
          profile_visibility?: string
          push_notifications?: boolean
          show_study_progress?: boolean
          show_test_scores?: boolean
          sms_results?: boolean
          sms_test_reminders?: boolean
          test_duration_preference?: string
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      user_study_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          id: string
          last_accessed_at: string | null
          lesson_id: string
          progress_percent: number | null
          time_spent_minutes: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lesson_id: string
          progress_percent?: number | null
          time_spent_minutes?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string
          progress_percent?: number | null
          time_spent_minutes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_study_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "study_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_study_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          active_session_token: string | null
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
          active_session_token?: string | null
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
          active_session_token?: string | null
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
      add_student_to_school: {
        Args: {
          p_class_level?: string
          p_school_id: string
          p_student_id?: string
          p_user_email: string
        }
        Returns: string
      }
      admin_delete_all_questions: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      apply_answer_normalization: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_count: number
          updated_count: number
        }[]
      }
      can_send_email: {
        Args: { email_type: string; target_user_id: string }
        Returns: boolean
      }
      can_view_full_pii: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      check_admin_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_auth_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_email_rate_limit: {
        Args: { recipient_email: string }
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
      check_user_lookup_rate_limit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      clear_session_token: {
        Args: { user_auth_id: string }
        Returns: boolean
      }
      convert_latex_mathbf_to_markdown: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
        }[]
      }
      delete_incomplete_questions: {
        Args: { target_subject?: string }
        Returns: {
          deleted: number
        }[]
      }
      delete_question_safely: {
        Args: { qid: string }
        Returns: boolean
      }
      delete_user_completely: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      delete_user_completely_by_app_id: {
        Args: { user_app_id: string }
        Returns: boolean
      }
      expire_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_incomplete_questions: {
        Args: Record<PropertyKey, never> | { target_subject?: string }
        Returns: {
          id: string
          reason: string
        }[]
      }
      fix_latex_questions: {
        Args: { target_subject?: string }
        Returns: {
          updated_count: number
        }[]
      }
      get_admin_proctoring_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          device_fingerprint: string
          email: string
          exam_id: string
          first_name: string
          id: string
          ip_address: unknown
          last_name: string
          proctoring_data: Json
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string
          suspicious_activity_count: number
          user_agent: string
          user_id: string
        }[]
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
      get_question_explanation_secure: {
        Args: { question_id_param: string }
        Returns: {
          correct_answer: Json
          explanation: string
        }[]
      }
      get_random_questions_for_exam: {
        Args: { target_exam_id: string }
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
      get_random_questions_for_subjects: {
        Args: { per_subject_count?: number; subject_ids: string[] }
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
      get_review_questions_for_attempt: {
        Args: { attempt_uuid: string }
        Returns: {
          correct_answer_index: number
          explanation: string
          id: string
          is_correct: boolean
          options: Json
          question_text: string
          subject_id: string
          subject_name: string
          time_spent_seconds: number
          user_answer_index: number
        }[]
      }
      get_school_subscription_status: {
        Args: { target_school_id: string }
        Returns: {
          end_date: string
          is_active: boolean
          plan_name: string
          student_seats: number
          used_seats: number
        }[]
      }
      get_secure_user_data: {
        Args: { target_user_id: string }
        Returns: {
          auth_user_id: string
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          is_suspended: boolean
          is_verified: boolean
          last_login_at: string
          last_name: string
          phone: string
          state: string
          updated_at: string
        }[]
      }
      get_student_attempt_data: {
        Args: { target_attempt_id: string }
        Returns: {
          created_at: string
          device_info: string
          exam_id: string
          id: string
          security_score: number
          selected_subjects: Json
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string
          time_remaining_seconds: number
          user_id: string
        }[]
      }
      get_student_bookings: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          description: string
          duration_minutes: number
          id: string
          is_paid: boolean
          meeting_link: string
          notes: string
          payment_status: string
          price: number
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          subject_id: string
          title: string
          tutor_id: string
          user_id: string
        }[]
      }
      get_student_exam_progress: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          exam_id: string
          id: string
          proctoring_data: Json
          security_score: number
          selected_subjects: Json
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          submitted_at: string
          time_remaining_seconds: number
          user_id: string
        }[]
      }
      get_student_exam_questions: {
        Args: { attempt_id_param: string }
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
      get_user_secure: {
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
      get_users_masked: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          auth_user_id: string
          country: string
          created_at: string
          date_of_birth: string
          device_fingerprint_masked: string
          email: string
          first_name: string
          id: string
          is_suspended: boolean
          is_verified: boolean
          last_login_at: string
          last_login_ip_masked: string
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
      is_account_locked: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_school_admin: {
        Args: { target_school_id: string; user_auth_id: string }
        Returns: boolean
      }
      is_session_valid: {
        Args: { token_to_check: string; user_auth_id: string }
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
      monitor_security_events: {
        Args: Record<PropertyKey, never>
        Returns: {
          event_count: number
          event_type: string
          last_occurrence: string
          severity: string
        }[]
      }
      normalize_question_answers: {
        Args: Record<PropertyKey, never>
        Returns: {
          new_format: number
          old_format: string
          question_id: string
          status: string
        }[]
      }
      notify_all_users: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
        }
        Returns: undefined
      }
      notify_premium_users: {
        Args: {
          notification_message: string
          notification_metadata?: Json
          notification_title: string
          notification_type?: string
        }
        Returns: undefined
      }
      recompute_results_for_attempt: {
        Args: { attempt_uuid: string }
        Returns: {
          correct: number
          percentage: number
          scaled_score: number
          total: number
          unanswered: number
          updated: boolean
          wrong: number
        }[]
      }
      record_login_attempt: {
        Args: {
          attempt_success: boolean
          user_email: string
          user_ip?: unknown
        }
        Returns: undefined
      }
      send_immediate_result_notification: {
        Args: { attempt_uuid: string }
        Returns: boolean
      }
      validate_admin_action: {
        Args: { action_type: string; target_data?: Json }
        Returns: boolean
      }
      validate_and_set_session_token: {
        Args: { new_token: string; user_auth_id: string }
        Returns: boolean
      }
      validate_answer_simple: {
        Args: { question_id_param: string; submitted_index: number }
        Returns: boolean
      }
      validate_question_answer: {
        Args: { question_id: string; submitted_answer: Json }
        Returns: boolean
      }
      validate_role_assignment: {
        Args: {
          role_to_assign: Database["public"]["Enums"]["app_role"]
          target_user_id: string
        }
        Returns: boolean
      }
      validate_student_answer: {
        Args: { question_id_param: string; submitted_answer: Json }
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
      course_category: "science" | "art" | "management"
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
      course_category: ["science", "art", "management"],
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
