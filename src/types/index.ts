// アプリ全体で使う型定義

export type TodoType = 'work' | 'private'
export type TodoStatus = 'active' | 'completed'

export type Category =
  | 'shopping'
  | 'reservation'
  | 'procedure'
  | 'payment'
  | 'housework'
  | 'gift'
  | 'other'

// 曜日と時間のリマインダー設定（1つのTODOに複数設定可能）
export type ReminderSetting = {
  days: string[] // ['Mon', 'Wed'] など。空配列は毎日
  time: string   // 'HH:MM' 形式
}

export type Todo = {
  id: string
  user_id: string
  title: string
  description?: string
  type: TodoType
  is_routine: boolean
  category?: Category
  is_completed: boolean
  reminder_settings?: ReminderSetting[]
  created_at: string
}

// カテゴリーの日本語ラベル
export const CATEGORY_LABELS: Record<Category, string> = {
  shopping:    '買い物',
  reservation: '予約',
  procedure:   '手続き・申請',
  payment:     '支払い・振込',
  housework:   '家事・タスク',
  gift:        'イベント・ギフト',
  other:       'その他',
}

// カテゴリーのバッジカラー（Tailwind）
export const CATEGORY_COLORS: Record<Category, string> = {
  shopping:    'bg-pink-500/20 text-pink-300',
  reservation: 'bg-purple-500/20 text-purple-300',
  procedure:   'bg-blue-500/20 text-blue-300',
  payment:     'bg-yellow-500/20 text-yellow-300',
  housework:   'bg-green-500/20 text-green-300',
  gift:        'bg-orange-500/20 text-orange-300',
  other:       'bg-gray-500/20 text-gray-300',
}

// Push通知のカテゴリー別メッセージ
export const CATEGORY_MESSAGES: Record<Category, string> = {
  shopping:    '買い忘れはありませんか？',
  reservation: 'そろそろ予約の時間（期限）ではありませんか？',
  procedure:   '手続き・申請の漏れはありませんか？',
  payment:     '支払い・振込の期日は大丈夫ですか？',
  housework:   'やるべき家事・タスクはありませんか？',
  gift:        'イベントやギフトの準備は進んでいますか？',
  other:       'やり残しているTODOはありませんか？',
}

// タブの定義
export type TabType = 'all' | 'work' | 'private' | 'routine'

export const TABS: { id: TabType; label: string }[] = [
  { id: 'all',     label: 'すべて' },
  { id: 'work',    label: '仕事' },
  { id: 'private', label: 'プライベート' },
  { id: 'routine', label: '定常' },
]

// 曜日の定義
export const DAYS_OF_WEEK = [
  { key: 'Sun', label: '日' },
  { key: 'Mon', label: '月' },
  { key: 'Tue', label: '火' },
  { key: 'Wed', label: '水' },
  { key: 'Thu', label: '木' },
  { key: 'Fri', label: '金' },
  { key: 'Sat', label: '土' },
]
