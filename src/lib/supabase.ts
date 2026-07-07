import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Kết nối Supabase — chỉ hoạt động khi đã cấu hình biến môi trường.
 * Tạo file `.env` (xem `.env.example`) với:
 *   VITE_SUPABASE_URL=https://xxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 * Chưa cấu hình → app chạy chế độ offline (dữ liệu localStorage), form đăng nhập bị khoá.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const supabaseConfigured = Boolean(supabase)
