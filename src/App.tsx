import { lazy, Suspense, useState } from 'react'
import type { FillUp } from './types'
import { useAppData } from './lib/storage'
import { byDateAsc } from './lib/stats'
import Dashboard from './components/Dashboard'
import History from './components/History'
import FillUpForm from './components/FillUpForm'
import Settings from './components/Settings'

const Stats = lazy(() => import('./components/Stats'))

type View = 'dashboard' | 'history' | 'stats' | 'settings'

export default function App() {
  const {
    fillUps,
    vehicles,
    settings,
    activeVehicle,
    addFillUp,
    updateFillUp,
    deleteFillUp,
    importFillUps,
    addVehicle,
    renameVehicle,
    deleteVehicle,
    setActiveVehicleId,
    setSettings,
  } = useAppData()
  const [view, setView] = useState<View>('dashboard')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FillUp | undefined>()

  const vehicleFillUps = fillUps.filter(
    (f) => f.vehicleId === activeVehicle.id,
  )
  const sorted = byDateAsc(vehicleFillUps)
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
  const handleSave = (data: Omit<FillUp, 'id' | 'vehicleId'>) => {
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
      className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium ${
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
          <img
            src={`${import.meta.env.BASE_URL}icon.svg`}
            alt=""
            className="h-8 w-8"
          />
          <h1 className="text-xl font-bold text-slate-900">Gas Tracker</h1>
          {vehicles.length > 1 && (
            <select
              className="ml-auto rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700"
              value={activeVehicle.id}
              onChange={(e) => setActiveVehicleId(e.target.value)}
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          )}
        </header>

        {formOpen ? (
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <FillUpForm
              initial={editing}
              lastOdometer={lastOdometer}
              settings={settings}
              onSave={handleSave}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        ) : (
          <>
            <nav className="mb-4 flex gap-1 rounded-xl bg-slate-200 p-1">
              {tab('dashboard', 'Home')}
              {tab('history', 'History')}
              {tab('stats', 'Stats')}
              {tab('settings', 'Settings')}
            </nav>

            {view === 'dashboard' && (
              <Dashboard fillUps={vehicleFillUps} settings={settings} />
            )}
            {view === 'history' && (
              <History
                fillUps={vehicleFillUps}
                settings={settings}
                onEdit={openEdit}
                onDelete={deleteFillUp}
              />
            )}
            {view === 'stats' && (
              <Suspense
                fallback={
                  <p className="py-8 text-center text-sm text-slate-400">
                    Loading charts…
                  </p>
                }
              >
                <Stats fillUps={vehicleFillUps} settings={settings} />
              </Suspense>
            )}
            {view === 'settings' && (
              <Settings
                fillUps={vehicleFillUps}
                vehicles={vehicles}
                activeVehicle={activeVehicle}
                settings={settings}
                onImport={importFillUps}
                onAddVehicle={addVehicle}
                onRenameVehicle={renameVehicle}
                onDeleteVehicle={deleteVehicle}
                onSelectVehicle={setActiveVehicleId}
                onChangeSettings={setSettings}
              />
            )}

            {view !== 'settings' && (
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
            )}
          </>
        )}
      </div>
    </div>
  )
}
