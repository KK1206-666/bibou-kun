'use client'

type Props = {
  onClose: () => void
}

// セクション見出しと内容のまとまり（アコーディオン表示）
function Section({ title, children, defaultOpen }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details
      open={defaultOpen}
      className="bg-slate-800 border border-slate-700 rounded-xl p-3 group"
    >
      <summary className="cursor-pointer text-sm font-bold text-slate-100 list-none flex items-center justify-between">
        {title}
        <span className="text-slate-500 text-xs group-open:hidden">▼ 開く</span>
        <span className="text-slate-500 text-xs hidden group-open:inline">▲ 閉じる</span>
      </summary>
      <div className="mt-3 space-y-2 text-xs text-slate-300 leading-relaxed">
        {children}
      </div>
    </details>
  )
}

export default function HelpModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-100">📖 使い方・マニュアル</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          <Section title="① 画面の基本的な見方" defaultOpen>
            <p>各カードはタップやボタンで以下のように操作できます。</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="text-slate-100">⠿（左端のハンドル）</span>：長押ししてドラッグすると、表示順を自由に変更できます</li>
              <li><span className="text-slate-100">チェックボックス／右下の ✓</span>：完了・未完了を切り替えます</li>
              <li><span className="text-slate-100">カードの本文をタップ</span>：編集モーダルが開きます</li>
              <li><span className="text-slate-100">右上の ×</span>：その備忘を削除します（確認メッセージが表示されます）</li>
              <li><span className="text-slate-100">💼仕事 / 🏠プライベート</span>：登録時に選んだタイプを表示するバッジです</li>
              <li><span className="text-slate-100">🔁定常</span>：繰り返し登録した「定常TODO」であることを示すバッジです</li>
              <li><span className="text-slate-100">カテゴリバッジ</span>：プライベートのTODOにのみ表示される分類（買い物・予約など7種類）です</li>
              <li><span className="text-slate-100">⏰期限バッジ</span>：設定した期限日。期限を過ぎると赤色で表示されます</li>
            </ul>
          </Section>

          <Section title="② タブの見方">
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="text-slate-100">すべて</span>：定常以外の未完了の備忘を表示します</li>
              <li><span className="text-slate-100">仕事 / プライベート</span>：タイプ別の未完了の備忘を表示します（定常TODOは含みません）</li>
              <li><span className="text-slate-100">定常</span>：「定常TODO」として登録した繰り返しタスクを、仕事・プライベートの区別なく表示します</li>
              <li><span className="text-slate-100">完了</span>：完了にした備忘のうち直近14日以内のものを表示します。14日を過ぎたものは自動的に削除されます</li>
            </ul>
          </Section>

          <Section title="③ 備忘を登録する">
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="text-slate-100">タイプ</span>：仕事 / プライベート から選択します</li>
              <li><span className="text-slate-100">タスク分類</span>：「通常備忘」か「定常TODO（繰り返し）」を選択します</li>
              <li><span className="text-slate-100">タイトル</span>：必須項目です</li>
              <li><span className="text-slate-100">説明（任意）</span>：補足情報を記入できます。改行もそのまま保存されます</li>
              <li><span className="text-slate-100">期限（任意）</span>：日付を選ぶと期限バッジが表示されます。「クリア」ボタンで期限を削除できます（定常TODOには設定できません）</li>
              <li><span className="text-slate-100">カテゴリ（プライベートのみ）</span>：7種類から選択します</li>
              <li><span className="text-slate-100">リマインダー通知（任意）</span>：「＋追加」で曜日・時刻を指定できます。曜日は初期状態で今日の曜日が選択されています。曜日を1つも選ばない場合は「毎日」その時刻に通知されます</li>
            </ul>
          </Section>

          <Section title="④ 編集・状況の追記">
            <ul className="list-disc pl-4 space-y-1">
              <li>カードの本文をタップすると編集モーダルが開き、登録時と同じ項目をすべて変更できます</li>
              <li>内容を変更したら「更新する」を押して保存します</li>
              <li>「状況を追記」欄にメモを入力して「追記」を押すと、説明欄の末尾に「・月/日 メモ内容」の形式で自動的に追記されます。やり取りの履歴として残せます</li>
            </ul>
          </Section>

          <Section title="⑤ 通知の設定と種類">
            <ul className="list-disc pl-4 space-y-1">
              <li>画面上部の「通知を許可する」ボタンを押すと、ブラウザのPush通知が有効になります</li>
              <li><span className="text-slate-100">iPhone（Safari）の場合</span>：共有ボタン→「ホーム画面に追加」でアプリをインストールしないとPush通知を受け取れません。未対応の場合は案内メッセージが表示されます</li>
              <li><span className="text-slate-100">リマインダー通知</span>：登録した曜日・時刻になると「📋タイトル」という通知が届きます</li>
              <li><span className="text-slate-100">期限通知</span>：定常TODO以外で期限を設定した備忘について、<span className="text-slate-100">期限の前日と当日の 8:00 / 12:00 / 18:00 / 21:00</span> に「明日が期限です」「本日が期限です」という通知が届きます（1日4回まで）</li>
            </ul>
          </Section>

          <Section title="⑥ 通知バッジ・赤丸の意味">
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="text-slate-100">ホーム画面アプリアイコンの数字バッジ</span>：受信したPush通知の件数です。アプリを開くと消えます（対応ブラウザのみ）</li>
              <li><span className="text-slate-100">備忘カード左端の赤丸</span>：その備忘にPush通知が届いたことを示します</li>
              <li><span className="text-slate-100">タブ下に表示される赤丸の数字</span>：そのタブ（すべて・仕事・プライベート・定常）に含まれる「通知が届いた備忘」の件数です</li>
              <li>これらの赤丸は、アプリを開いた後にバックグラウンドに回す（閉じる）と全てリセットされ、次回開いたときは新しく届いた通知分だけが表示されます</li>
            </ul>
          </Section>

          <Section title="⑦ 制約・注意事項">
            <ul className="list-disc pl-4 space-y-1">
              <li>Push通知にはブラウザ・OS側の通知許可が必要です</li>
              <li>iPhoneはホーム画面に追加（PWAインストール）しないとPush通知を受け取れません</li>
              <li>完了した備忘は「完了」タブで直近14日間のみ確認でき、それ以降は自動的に削除されます</li>
              <li>期限通知は定常TODO以外が対象です（定常TODOには期限を設定できません）</li>
              <li>通知バッジ（アイコン・赤丸）はBadging APIに対応したブラウザ・OSでのみ表示されます</li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}
