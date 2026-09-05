export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string
          id: string
          pinned: boolean
          posted_at: string
          posted_by: string | null
          season_id: string
          source: string | null
          team_id: string | null
          title: string
        }
        Insert: {
          body: string
          id?: string
          pinned?: boolean
          posted_at?: string
          posted_by?: string | null
          season_id: string
          source?: string | null
          team_id?: string | null
          title: string
        }
        Update: {
          body?: string
          id?: string
          pinned?: boolean
          posted_at?: string
          posted_by?: string | null
          season_id?: string
          source?: string | null
          team_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "v_public_staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_attempts: {
        Row: {
          attempted_at: string
          client_ip: string
          id: number
          identity_id: string | null
          identity_type: string
          succeeded: boolean
        }
        Insert: {
          attempted_at?: string
          client_ip?: string
          id?: never
          identity_id?: string | null
          identity_type: string
          succeeded: boolean
        }
        Update: {
          attempted_at?: string
          client_ip?: string
          id?: never
          identity_id?: string | null
          identity_type?: string
          succeeded?: boolean
        }
        Relationships: []
      }
      awards: {
        Row: {
          award: string
          generic_recipient: string | null
          id: string
          level: string | null
          notes: string | null
          player_id: string | null
          season_id: string
        }
        Insert: {
          award: string
          generic_recipient?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          player_id?: string | null
          season_id: string
        }
        Update: {
          award?: string
          generic_recipient?: string | null
          id?: string
          level?: string | null
          notes?: string | null
          player_id?: string | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "awards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "awards_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      discipline: {
        Row: {
          card: Database["public"]["Enums"]["card_type"]
          id: string
          jersey: number | null
          minute: number | null
          player_id: string | null
          report_id: string
          side: Database["public"]["Enums"]["game_side"]
        }
        Insert: {
          card: Database["public"]["Enums"]["card_type"]
          id?: string
          jersey?: number | null
          minute?: number | null
          player_id?: string | null
          report_id: string
          side: Database["public"]["Enums"]["game_side"]
        }
        Update: {
          card?: Database["public"]["Enums"]["card_type"]
          id?: string
          jersey?: number | null
          minute?: number | null
          player_id?: string | null
          report_id?: string
          side?: Database["public"]["Enums"]["game_side"]
        }
        Relationships: [
          {
            foreignKeyName: "discipline_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discipline_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          date: string
          district: boolean
          end_time: string | null
          game_num: number | null
          home_away: Database["public"]["Enums"]["home_away"] | null
          id: string
          location: string | null
          opponent_id: string | null
          playoff: boolean
          playoff_round: string | null
          season_id: string
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"]
          team_id: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
        }
        Insert: {
          date: string
          district?: boolean
          end_time?: string | null
          game_num?: number | null
          home_away?: Database["public"]["Enums"]["home_away"] | null
          id?: string
          location?: string | null
          opponent_id?: string | null
          playoff?: boolean
          playoff_round?: string | null
          season_id: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          team_id?: string | null
          title: string
          type: Database["public"]["Enums"]["event_type"]
        }
        Update: {
          date?: string
          district?: boolean
          end_time?: string | null
          game_num?: number | null
          home_away?: Database["public"]["Enums"]["home_away"] | null
          id?: string
          location?: string | null
          opponent_id?: string | null
          playoff?: boolean
          playoff_round?: string | null
          season_id?: string
          start_time?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          team_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "events_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "opponents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_reports: {
        Row: {
          created_at: string
          event_id: string
          final_chs: number | null
          final_opp: number | null
          id: string
          no_goals: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          final_chs?: number | null
          final_opp?: number | null
          id?: string
          no_goals?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          final_chs?: number | null
          final_opp?: number | null
          id?: string
          no_goals?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "v_public_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          assist_jersey: number | null
          assist_player_id: string | null
          id: string
          minute: number | null
          own_goal: boolean
          report_id: string
          scorer_jersey: number | null
          scorer_player_id: string | null
          side: Database["public"]["Enums"]["game_side"]
        }
        Insert: {
          assist_jersey?: number | null
          assist_player_id?: string | null
          id?: string
          minute?: number | null
          own_goal?: boolean
          report_id: string
          scorer_jersey?: number | null
          scorer_player_id?: string | null
          side: Database["public"]["Enums"]["game_side"]
        }
        Update: {
          assist_jersey?: number | null
          assist_player_id?: string | null
          id?: string
          minute?: number | null
          own_goal?: boolean
          report_id?: string
          scorer_jersey?: number | null
          scorer_player_id?: string | null
          side?: Database["public"]["Enums"]["game_side"]
        }
        Relationships: [
          {
            foreignKeyName: "goals_assist_player_id_fkey"
            columns: ["assist_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_scorer_player_id_fkey"
            columns: ["scorer_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      opponent_records: {
        Row: {
          event_id: string
          losses: number
          ties: number
          wins: number
        }
        Insert: {
          event_id: string
          losses?: number
          ties?: number
          wins?: number
        }
        Update: {
          event_id?: string
          losses?: number
          ties?: number
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "opponent_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opponent_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "v_public_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      opponents: {
        Row: {
          archived_at: string | null
          id: string
          name: string
        }
        Insert: {
          archived_at?: string | null
          id?: string
          name: string
        }
        Update: {
          archived_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      player_game_stats: {
        Row: {
          clearances: number
          half1: boolean
          half2: boolean
          id: string
          interceptions: number
          passes_completed: number
          passes_missed: number
          player_id: string
          report_id: string
          saves: number
          shots_off: number
          shots_on: number
          tackles_won: number
        }
        Insert: {
          clearances?: number
          half1?: boolean
          half2?: boolean
          id?: string
          interceptions?: number
          passes_completed?: number
          passes_missed?: number
          player_id: string
          report_id: string
          saves?: number
          shots_off?: number
          shots_on?: number
          tackles_won?: number
        }
        Update: {
          clearances?: number
          half1?: boolean
          half2?: boolean
          id?: string
          interceptions?: number
          passes_completed?: number
          passes_missed?: number
          player_id?: string
          report_id?: string
          saves?: number
          shots_off?: number
          shots_on?: number
          tackles_won?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_game_stats_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_game_stats_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          auth_user_id: string | null
          captain: boolean
          created_at: string
          grad_year: number | null
          grade_level: number | null
          id: string
          jersey: number | null
          name: string
          pin_hash: string
          positions: string[]
          team_id: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          captain?: boolean
          created_at?: string
          grad_year?: number | null
          grade_level?: number | null
          id?: string
          jersey?: number | null
          name: string
          pin_hash: string
          positions?: string[]
          team_id: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          captain?: boolean
          created_at?: string
          grad_year?: number | null
          grade_level?: number | null
          id?: string
          jersey?: number | null
          name?: string
          pin_hash?: string
          positions?: string[]
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      pr_tracker: {
        Row: {
          chs_power_rating: number | null
          chs_rank: number | null
          date: string
          id: string
          last_playoff_rating: number | null
          last_playoff_team: string | null
          season_id: string
        }
        Insert: {
          chs_power_rating?: number | null
          chs_rank?: number | null
          date: string
          id?: string
          last_playoff_rating?: number | null
          last_playoff_team?: string | null
          season_id: string
        }
        Update: {
          chs_power_rating?: number | null
          chs_rank?: number | null
          date?: string
          id?: string
          last_playoff_rating?: number | null
          last_playoff_team?: string | null
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pr_tracker_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          event_id: string
          player_id: string
          responded_at: string
          response: Database["public"]["Enums"]["rsvp_response"]
        }
        Insert: {
          event_id: string
          player_id: string
          responded_at?: string
          response: Database["public"]["Enums"]["rsvp_response"]
        }
        Update: {
          event_id?: string
          player_id?: string
          responded_at?: string
          response?: Database["public"]["Enums"]["rsvp_response"]
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v_public_schedule"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvps_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          closed: boolean
          closed_at: string | null
          district_champion: boolean
          district_finish: string
          id: string
          label: string
          opened_at: string
          snapshot: Json | null
        }
        Insert: {
          closed?: boolean
          closed_at?: string | null
          district_champion?: boolean
          district_finish?: string
          id?: string
          label: string
          opened_at?: string
          snapshot?: Json | null
        }
        Update: {
          closed?: boolean
          closed_at?: string | null
          district_champion?: boolean
          district_finish?: string
          id?: string
          label?: string
          opened_at?: string
          snapshot?: Json | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          pin_hash: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          pin_hash: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          pin_hash?: string
        }
        Relationships: []
      }
      staff_roles: {
        Row: {
          id: string
          position: string
          role_type: Database["public"]["Enums"]["staff_role_type"]
          staff_id: string
          team_id: string | null
        }
        Insert: {
          id?: string
          position: string
          role_type: Database["public"]["Enums"]["staff_role_type"]
          staff_id: string
          team_id?: string | null
        }
        Update: {
          id?: string
          position?: string
          role_type?: Database["public"]["Enums"]["staff_role_type"]
          staff_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_roles_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_roles_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "v_public_staff_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_roles_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_game_stats: {
        Row: {
          corners: number | null
          fouls: number | null
          free_kicks: number | null
          id: string
          location_splits: Json | null
          possession_pct: number | null
          report_id: string
          shots_conceded: number | null
        }
        Insert: {
          corners?: number | null
          fouls?: number | null
          free_kicks?: number | null
          id?: string
          location_splits?: Json | null
          possession_pct?: number | null
          report_id: string
          shots_conceded?: number | null
        }
        Update: {
          corners?: number | null
          fouls?: number | null
          free_kicks?: number | null
          id?: string
          location_splits?: Json | null
          possession_pct?: number | null
          report_id?: string
          shots_conceded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "team_game_stats_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: true
            referencedRelation: "game_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      team_goals: {
        Row: {
          description: string
          id: string
          metric: Database["public"]["Enums"]["team_goal_metric"]
          season_id: string
          target_number: number | null
          target_record: string | null
        }
        Insert: {
          description: string
          id?: string
          metric: Database["public"]["Enums"]["team_goal_metric"]
          season_id: string
          target_number?: number | null
          target_record?: string | null
        }
        Update: {
          description?: string
          id?: string
          metric?: Database["public"]["Enums"]["team_goal_metric"]
          season_id?: string
          target_number?: number | null
          target_record?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_goals_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          archived_at: string | null
          id: string
          is_varsity: boolean
          name: string
        }
        Insert: {
          archived_at?: string | null
          id?: string
          is_varsity?: boolean
          name: string
        }
        Update: {
          archived_at?: string | null
          id?: string
          is_varsity?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_public_announcements: {
        Row: {
          body: string | null
          id: string | null
          pinned: boolean | null
          posted_at: string | null
          team_name: string | null
          title: string | null
        }
        Relationships: []
      }
      v_public_schedule: {
        Row: {
          date: string | null
          district: boolean | null
          end_time: string | null
          home_away: Database["public"]["Enums"]["home_away"] | null
          id: string | null
          location: string | null
          opponent_id: string | null
          opponent_name: string | null
          playoff: boolean | null
          playoff_round: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["event_status"] | null
          team_name: string | null
          title: string | null
          type: Database["public"]["Enums"]["event_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "events_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "opponents"
            referencedColumns: ["id"]
          },
        ]
      }
      v_public_staff_directory: {
        Row: {
          first_name: string | null
          id: string | null
          last_name: string | null
          position: string | null
          role_type: Database["public"]["Enums"]["staff_role_type"] | null
          team_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_role: { Args: never; Returns: string }
      current_player_team: { Args: never; Returns: string }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      game_result: {
        Args: { p_report_id: string }
        Returns: {
          chs_score: number
          opp_score: number
          played: boolean
        }[]
      }
      is_coach: { Args: never; Returns: boolean }
    }
    Enums: {
      card_type: "Yellow" | "Red"
      event_status: "Scheduled" | "Completed" | "Cancelled" | "Postponed"
      event_type:
        | "Practice"
        | "Game"
        | "Scrimmage"
        | "Classroom Session"
        | "Other"
      game_side: "CHS" | "OPP"
      home_away: "Home" | "Away"
      rsvp_response: "Yes" | "No" | "Maybe"
      staff_role_type: "team_coach" | "admin"
      team_goal_metric:
        | "wins"
        | "losses"
        | "ties"
        | "win_pct"
        | "gf"
        | "avg_gf"
        | "ga"
        | "avg_ga"
        | "gd"
        | "shutouts"
        | "district_wins"
        | "district_losses"
        | "district_record"
        | "power_rating"
        | "power_ranking"
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
      card_type: ["Yellow", "Red"],
      event_status: ["Scheduled", "Completed", "Cancelled", "Postponed"],
      event_type: [
        "Practice",
        "Game",
        "Scrimmage",
        "Classroom Session",
        "Other",
      ],
      game_side: ["CHS", "OPP"],
      home_away: ["Home", "Away"],
      rsvp_response: ["Yes", "No", "Maybe"],
      staff_role_type: ["team_coach", "admin"],
      team_goal_metric: [
        "wins",
        "losses",
        "ties",
        "win_pct",
        "gf",
        "avg_gf",
        "ga",
        "avg_ga",
        "gd",
        "shutouts",
        "district_wins",
        "district_losses",
        "district_record",
        "power_rating",
        "power_ranking",
      ],
    },
  },
} as const
