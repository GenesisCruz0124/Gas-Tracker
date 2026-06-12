import { useState } from 'react'
import type { FillUp } from './types'
import { useFillUps } from './lib/storage'
import { byDateAsc } from './lib/stats'
import Dashboard from './components/Dashboard'
import History from './components/History'
import FillUpForm from './components/FillUpForm'

type View = 'dashboard' | 'history'

export default function App() {
  const { fillUps, addFillUp, updateFillUp, deleteFillUp } = useFillUps()
  const [view, setView] = useState<View>('dashboard')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FillUp | undefined>()

  const sorted = byDateAsc(fillUps)
  const lastOdometer =
    sorted.length > 0 ? sorted[sorted.length - 1].odometer : undefined

  const openAdd = () => {
    setEditing(undefined)
    setFormOpen(true)
  }
  const openEdit = (fillUp: FillUp) => {
    setEditing(fillUp)
    setFormOpen(true)
  }
  const handleSave = (data: Omit<FillUp, 'id'>) => {
    if (editing) {
      updateFillUp(editing.id, data)
    } else {
      addFillUp(data)
    }
    setFormOpen(false)
  }

  const tab = (v: View, text: string) => (
    <button
      onClick={() => setView(v)}
      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
        view === v
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {text}
    </button>
  )

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-lg px-4 pb-24 pt-6">
        <header className="mb-6 flex items-center gap-2">
          <span className="text-2xl">⛽</span>
          <h1 className="text-xl font-bold text-slate-900">Gas Tracker</h1>
        </header>

        {formOpen ? (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <FillUpForm
              initial={editing}
              lastOdometer={lastOdometer}
              onSave={handleSave}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        ) : (
          <>
            <nav className="mb-4 flex gap-1 rounded-xl bg-slate-200 p-1">
              {tab('dashboard', 'Dashboard')}
              {tab('history', 'History')}
            </nav>

            {view === 'dashboard' ? (
              <Dashboard fillUps={fillUps} />
            ) : (
              <History
                fillUps={fillUps}
                onEdit={openEdit}
                onDelete={deleteFillUp}
              />
            )}

            <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-slate-100 via-slate-100 to-transparent px-4 pb-6 pt-8">
              <div className="mx-auto max-w-lg">
                <button
                  onClick={openAdd}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-lg font-semibold text-white shadow-lg hover:bg-blue-700"
                >
                  + Add Fill-Up
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
