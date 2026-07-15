// ログイン・サインアップ画面の下部に表示する「備忘君でできること」の説明セクション
export default function AppIntro() {
  const flow = [
    { num: '①', title: '備忘を登録', desc: '仕事・プライベートを選び、タイトルと期限（任意）を入力するだけ' },
    { num: '②', title: '分類・整理', desc: 'カテゴリ（プライベートのみ7種類）や「定常TODO」で繰り返しタスクも管理できる' },
    { num: '③', title: '通知を設定', desc: '定常TODOは曜日・時刻のリマインダー、通常備忘は期限に応じて自動でPush通知' },
    { num: '④', title: '完了にする', desc: 'チェックで完了。完了済みは14日間だけ確認でき、それ以降は自動削除される' },
  ]

  const features = [
    { icon: '💼', title: '仕事・プライベートの完全分離', desc: 'タイプを分けて登録でき、タブでいつでも切り替えて確認できる' },
    { icon: '🏷️', title: 'カテゴリ分類（7種類）', desc: '買い物・予約・手続き・支払いなど、プライベートの備忘を種類ごとに整理' },
    { icon: '🔁', title: '定常TODO（繰り返しタスク）', desc: '毎週・隔週・「毎月最終金曜日」のような月内の曜日パターンにも対応' },
    { icon: '🔔', title: 'リマインダー通知', desc: '定常TODOに設定した曜日・時刻になると、ブラウザへPush通知が届く' },
    { icon: '⏰', title: '期限通知', desc: '通常備忘は期限の前日・当日に加え、超過後も完了にするまで毎日通知' },
    { icon: '⠿', title: '並び替え・状況の追記', desc: 'ドラッグで表示順を変更でき、対応状況をメモとして追記して残せる' },
  ]

  const notes = [
    'Push通知にはブラウザ・OS側の通知許可が必要です',
    'iPhone（Safari）はホーム画面に追加（PWAインストール）しないとPush通知を受け取れません',
    'リマインダー通知は「定常TODO」のみ設定できます（通常備忘は期限通知でカバーします）',
    '期限通知は「通常備忘」のみが対象です（定常TODOには期限を設定できません）',
    '完了にした備忘は直近14日間のみ確認でき、それ以降は自動的に削除されます',
  ]

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pb-16 text-slate-300">
      {/* 導入 */}
      <div className="text-center mb-10">
        <h2 className="text-xl font-bold text-slate-100 mb-2">備忘君でできること</h2>
        <p className="text-sm text-slate-400">
          仕事とプライベートのやることを一元管理し、抜け漏れをPush通知で防ぐタスク管理アプリです
        </p>
      </div>

      {/* 使い方の流れ */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-indigo-300 mb-3">使い方の流れ</h3>
        <div className="space-y-2">
          {flow.map((s) => (
            <div key={s.num} className="flex items-start gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {s.num}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100">{s.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 主な機能 */}
      <div className="mb-10">
        <h3 className="text-sm font-bold text-indigo-300 mb-3">主な機能</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {features.map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base leading-none">{f.icon}</span>
                <p className="text-sm font-semibold text-slate-100">{f.title}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 注意事項 */}
      <div>
        <h3 className="text-sm font-bold text-amber-300 mb-3">ご利用にあたっての注意事項</h3>
        <ul className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          {notes.map((n) => (
            <li key={n} className="flex items-start gap-2 text-xs text-slate-400">
              <span className="text-amber-400 flex-shrink-0">・</span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
