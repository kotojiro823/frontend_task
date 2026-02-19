// app/tasks/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Task = {
  id: number
  title: string
  description: string
  completed: boolean
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const fetchTasks = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('ログインが必要です')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error('タスクの取得に失敗しました')
      const data = await res.json()
      setTasks(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    console.log('現在のタスク一覧:', tasks)
  }, [tasks])


  const handleLogout = () => {
    localStorage.removeItem('token')  // トークンを削除
    window.location.href = '/login'   // ログイン画面にリダイレクト
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [])

  const router = useRouter()

  const handleAddTask = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('ログインが必要です')
      return
    }

    try {
      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      })

      if (!res.ok) throw new Error('タスクの追加に失敗しました')

      const newTask = await res.json()
      setTasks(prev => [...prev, newTask])
      setTitle('')
      setDescription('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('ログインが必要です')
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('削除に失敗しました')

      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description)
  }

  const handleUpdateTask = async (id: number) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/tasks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editTitle,
        description: editDescription,
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setTasks(prev =>
        prev.map(task => (task.id === id ? updated : task))
      )
      setEditingId(null)
    } else {
      setError('タスクの更新に失敗しました')
    }
  }

  const handleToggleStatus = async (taskId: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('ログインが必要です')
      return
    }

    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('ステータスの更新に失敗しました')

      const updatedTask = await res.json()
      setTasks(prev =>
        prev.map(task => (task.id === taskId ? updatedTask : task))
      )
    } catch (err: any) {
      setError(err.message)
    }
  }

  
  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:underline"
        >
          ログアウト
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="タイトル"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="border p-2 mr-2 w-1/3"
        />
        <input
          type="text"
          placeholder="説明"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border p-2 mr-2 w-1/2"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          追加
        </button>
      </div>

      <ul className="space-y-3">
        {tasks.map(task => (
          <li
            key={task.id}
            className="border p-3 rounded shadow flex justify-between items-center"
          >
            <div className="flex-1 mr-4">
              {editingId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="border p-1 w-full mb-1"
                  />
                  <input
                    type="text"
                    value={editDescription ?? ''}
                    onChange={e => setEditDescription(e.target.value)}
                    className="border p-1 w-full text-sm text-gray-600"
                  />
                </>
              ) : (
                <>
                  <p className="font-semibold">{task.title}</p>
                </>
              )}

              <p className="text-sm text-gray-600 min-h-[1.25rem] whitespace-pre-wrap">
                {task.description}
              </p>
            </div>

            <span
              className={`text-sm font-medium ${
                task.completed ? 'text-green-600' : 'text-yellow-600'
              }`}
            >
              {task.completed ? '完了' : '未完了'}
            </span>

            <button
              onClick={() => handleToggleStatus(task.id)} 
              className="text-xl hover:opacity-70 ml-2" 
              title="ステータスを切り替え"
            >
              {task.completed ? '▣' : '▢'}
            </button>

            {/*
            <button
              onClick={() => handleToggleStatus(task.id)}
              className="text-xl hover:opacity-70 ml-2"
              title="ステータスを切り替え"
            >
              🔁
            </button>
            */}

            <div className="flex items-center ml-4 space-x-2">
              {editingId === task.id ? (
                <>
                  <button
                    onClick={() => handleUpdateTask(task.id)}
                    className="text-blue-600 hover:underline"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 hover:underline"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('本当に削除しますか？')) {
                        handleDeleteTask(task.id)
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditClick(task)}
                    className="text-blue-600 hover:underline"
                  >
                    編集
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
