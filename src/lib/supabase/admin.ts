// Cronなどサーバー間通信専用のSupabaseクライアント
// service_roleキーを使うためRLSを全てバイパスする（クライアントには絶対に渡さないこと）
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
