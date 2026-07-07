import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Kết nối Supabase.
 * Ưu tiên biến môi trường (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY nếu có),
 * nếu không sẽ dùng giá trị mặc định bên dưới.
 * Lưu ý: anon key là khoá công khai phía client — an toàn dữ liệu do Row Level Security đảm nhiệm.
 */
const FALLBACK_URL = 'https://jctmrqkcawodjzswkosd.supabase.co'
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjdG1ycWtjYXdvZGp6c3drb3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDI1NzQsImV4cCI6MjA5ODA3ODU3NH0.bGCoBz9WbGMno_gGb9RVZtabF5JVwuFVAaoTtM00R9A'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || FALLBACK_URL
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || FALLBACK_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const supabaseConfigured = Boolean(supabase)
