// todo-frontend/page/login.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignupModal from './components/SignupModal'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showSignup, setShowSignup] = useState(false)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const [showUsers, setShowUsers] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [userError, setUserError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include',
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      })

      if (!res.ok) {
        throw new Error('ログインに失敗しました')
      }

      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      router.push('/tasks')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fetchUsers = async () => {
    setUserError('')
    try {
      const res = await fetch(`${apiUrl}/users/`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('ユーザー一覧の取得に失敗しました')
      const data = await res.json()
      setUsers(data)
    } catch (err: any) {
      setUserError(err.message)
    }
  }

  const handleToggleUsers = () => {
    if (!showUsers) {
      fetchUsers()
    }
    setShowUsers(!showUsers)
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">タスク管理へようこそ！</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1">ユーザー名</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between items-center space-x-4 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ログイン
          </button>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowSignup(true)}
              className="text-sm text-blue-600 hover:underline"
            >
              ユーザー新規作成
            </button>
            <button
              type="button"
              onClick={handleToggleUsers}
              className="text-sm text-green-600 hover:underline"
            >
              {showUsers ? '一覧を閉じる' : 'ユーザー一覧を表示'}
            </button>
          </div>
        </div>
      </form>

      {showUsers && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">ユーザー一覧</h2>
          {userError && <p className="text-red-500">{userError}</p>}
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <span>{user.username}</span>
                <button
                  onClick={async () => {
                    const confirm = window.confirm(`${user.username} を削除しますか？`)
                    if (!confirm) return

                    const password = prompt('削除確認のためパスワードを入力してください')
                    if (password !== 'delete') {
                      alert('パスワードが正しくありません')
                      return
                    }

                    try {
                      const res = await fetch(`${apiUrl}/users/${user.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password }),
                      })
                      if (!res.ok) {
                        throw new Error('削除に失敗しました')
                      }
                      setUsers((prev) => prev.filter((u) => u.id !== user.id))
                    } catch (err: any) {
                      setUserError(err.message)
                    }
                  }}
                  className="text-sm text-red-600 hover:underline ml-4"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SignupModal isOpen={showSignup} onClose={() => setShowSignup(false)} />
    </div>
  )
}
