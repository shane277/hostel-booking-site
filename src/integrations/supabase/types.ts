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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          academic_year: string
          amount_paid: number | null
          booking_status: Database["public"]["Enums"]["booking_status"] | null
          created_at: string
          hold_expires_at: string | null
          hostel_id: string
          id: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          room_id: string | null
          semester: string
          student_id: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          amount_paid?: number | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string
          hold_expires_at?: string | null
          hostel_id: string
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          room_id?: string | null
          semester: string
          student_id: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount_paid?: number | null
          booking_status?: Database["public"]["Enums"]["booking_status"] | null
          created_at?: string
          hold_expires_at?: string | null
          hostel_id?: string
          id?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          room_id?: string | null
          semester?: string
          student_id?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          created_at: string
          hostel_id: string | null
          id: string
          landlord_id: string
          last_message_at: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          hostel_id?: string | null
          id?: string
          landlord_id: string
          last_message_at?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          hostel_id?: string | null
          id?: string
          landlord_id?: string
          last_message_at?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_booking_id"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_hostel_id"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string
          amenities: string[] | null
          available_rooms: number
          city: string
          created_at: string
          description: string | null
          hostel_type: Database["public"]["Enums"]["hostel_type"]
          id: string
          images: string[] | null
          is_active: boolean | null
          is_verified: boolean | null
          landlord_id: string
          latitude: number | null
          longitude: number | null
          name: string
          price_per_academic_year: number | null
          price_per_semester: number
          rating: number | null
          region: string
          security_deposit: number | null
          total_reviews: number | null
          total_rooms: number
          updated_at: string
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_rooms?: number
          city: string
          created_at?: string
          description?: string | null
          hostel_type: Database["public"]["Enums"]["hostel_type"]
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          landlord_id: string
          latitude?: number | null
          longitude?: number | null
          name: string
          price_per_academic_year?: number | null
          price_per_semester: number
          rating?: number | null
          region: string
          security_deposit?: number | null
          total_reviews?: number | null
          total_rooms?: number
          updated_at?: string
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_rooms?: number
          city?: string
          created_at?: string
          description?: string | null
          hostel_type?: Database["public"]["Enums"]["hostel_type"]
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          is_verified?: boolean | null
          landlord_id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          price_per_academic_year?: number | null
          price_per_semester?: number
          rating?: number | null
          region?: string
          security_deposit?: number | null
          total_reviews?: number | null
          total_rooms?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          conversation_id: string
          created_at: string
          hostel_id: string | null
          id: string
          message_type: string
          read_at: string | null
          recipient_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          hostel_id?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          hostel_id?: string | null
          id?: string
          message_type?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_booking_id"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_hostel_id"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_name: string | null
          created_at: string
          full_name: string
          id: string
          institution: Database["public"]["Enums"]["institution"] | null
          phone_number: string | null
          program: string | null
          student_id: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Insert: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          full_name: string
          id?: string
          institution?: Database["public"]["Enums"]["institution"] | null
          phone_number?: string | null
          program?: string | null
          student_id?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Update: {
          avatar_url?: string | null
          business_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          institution?: Database["public"]["Enums"]["institution"] | null
          phone_number?: string | null
          program?: string | null
          student_id?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
        }
        Relationships: []
      }
      review_helpfulness: {
        Row: {
          created_at: string
          id: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_helpful: boolean
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_helpful?: boolean
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpfulness_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          facilities_rating: number | null
          helpful_count: number | null
          hostel_id: string
          id: string
          is_verified: boolean | null
          landlord_response: string | null
          landlord_response_date: string | null
          location_rating: number | null
          photos: string[] | null
          rating: number
          room_cleanliness_rating: number | null
          security_rating: number | null
          stay_duration: string | null
          student_id: string
          title: string | null
          updated_at: string
          value_for_money_rating: number | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          facilities_rating?: number | null
          helpful_count?: number | null
          hostel_id: string
          id?: string
          is_verified?: boolean | null
          landlord_response?: string | null
          landlord_response_date?: string | null
          location_rating?: number | null
          photos?: string[] | null
          rating: number
          room_cleanliness_rating?: number | null
          security_rating?: number | null
          stay_duration?: string | null
          student_id: string
          title?: string | null
          updated_at?: string
          value_for_money_rating?: number | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          facilities_rating?: number | null
          helpful_count?: number | null
          hostel_id?: string
          id?: string
          is_verified?: boolean | null
          landlord_response?: string | null
          landlord_response_date?: string | null
          location_rating?: number | null
          photos?: string[] | null
          rating?: number
          room_cleanliness_rating?: number | null
          security_rating?: number | null
          stay_duration?: string | null
          student_id?: string
          title?: string | null
          updated_at?: string
          value_for_money_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          capacity: number
          created_at: string
          hostel_id: string
          id: string
          images: string[] | null
          is_available: boolean | null
          occupied: number | null
          price_per_academic_year: number | null
          price_per_semester: number
          room_number: string
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          capacity: number
          created_at?: string
          hostel_id: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          occupied?: number | null
          price_per_academic_year?: number | null
          price_per_semester: number
          room_number: string
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          capacity?: number
          created_at?: string
          hostel_id?: string
          id?: string
          images?: string[] | null
          is_available?: boolean | null
          occupied?: number | null
          price_per_academic_year?: number | null
          price_per_semester?: number
          room_number?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_room_availability: {
        Args: { room_uuid: string }
        Returns: boolean
      }
      create_booking_with_conflict_check: {
        Args: {
          p_academic_year: string
          p_hostel_id: string
          p_room_id: string
          p_semester: string
          p_student_id: string
          p_total_amount: number
        }
        Returns: {
          booking_id: string
          error_message: string
          success: boolean
        }[]
      }
      expire_room_holds: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "on_hold"
      hostel_type: "male" | "female" | "mixed"
      institution:
        | "university_of_ghana"
        | "kwame_nkrumah_university"
        | "university_of_cape_coast"
        | "ghana_institute_of_management"
        | "university_of_professional_studies"
        | "central_university"
        | "ashesi_university"
        | "other"
      payment_status:
        | "pending"
        | "partial"
        | "completed"
        | "failed"
        | "refunded"
      room_type: "single" | "double" | "triple" | "quad" | "dormitory"
      user_type: "student" | "landlord" | "admin"
      verification_status: "pending" | "verified" | "rejected"
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
      booking_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "on_hold",
      ],
      hostel_type: ["male", "female", "mixed"],
      institution: [
        "university_of_ghana",
        "kwame_nkrumah_university",
        "university_of_cape_coast",
        "ghana_institute_of_management",
        "university_of_professional_studies",
        "central_university",
        "ashesi_university",
        "other",
      ],
      payment_status: ["pending", "partial", "completed", "failed", "refunded"],
      room_type: ["single", "double", "triple", "quad", "dormitory"],
      user_type: ["student", "landlord", "admin"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
