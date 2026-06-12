import { useRef, useState } from 'react'
import type {
  AppSettings,
  DistanceUnit,
  FillUp,
  Vehicle,
  VolumeUnit,
} from '../types'
import { downloadFile, fromCsv, fromJson, toCsv } from '../lib/csv'

interface Props {
  fillUps: FillUp[] // active vehicle's fill-ups only
  vehicles: Vehicle[]
  activeVehicle: Vehicle
  settings: AppSettings
  onImport: (fillUps: Omit<FillUp, 'id'>[]) => void
  onAddVehicle: (name: string) => void
  onRenameVehicle: (id: string, name: string) => void
  onDeleteVehicle: (id: string) => void
  onSelectVehicle: (id: string) => void
  onChangeSettings: (settings: AppSettings) => void
}

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">{title}</h2>
      {children}
    </div>
  )
}

function UnitToggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: [T, string][]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-200 p-1">
      {options.map(([opt, text]) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
            value === opt
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

export default function Settings({
  fillUps,
  vehicles,
  activeVehicle,
  settings,
  onImport,
  onAddVehicle,
  onRenameVehicle,
  onDeleteVehicle,
  onSelectVehicle,
  onChangeSettings,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [newVehicle, setNewVehicle] = useState('')
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error'
    text: string
  } | null>(null)

  const stamp = new Date().toISOString().slice(0, 10)
  const slug = activeVehicle.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')

  const exportCsv = () =>
    downloadFile(`gas-tracker-${slug}-${stamp}.csv`, toCsv(fillUps), 'text/csv')
  const exportJson = () =>
    downloadFile(
      `gas-tracker-${slug}-${stamp}.json`,
      JSON.stringify(fillUps, null, 2),
      'application/json',
    )

  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      const imported = file.name.toLowerCase().endsWith('.csv')
        ? fromCsv(text)
        : fromJson(text)
      onImport(imported)
      setMessage({
        kind: 'ok',
        text: `Imported ${imported.length} fill-up${imported.length === 1 ? '' : 's'} to ${activeVehicle.name}.`,
      })
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Could not read that file.',
      })
    }
  }

  const rename = (vehicle: Vehicle) => {
    const name = prompt('Vehicle name', vehicle.name)?.trim()
    if (name) onRenameVehicle(vehicle.id, name)
  }

  const remove = (vehicle: Vehicle) => {
    if (
      confirm(
        `Delete "${vehicle.name}" and all of its fill-ups? This cannot be undone.`,
      )
    ) {
      onDeleteVehicle(vehicle.id)
    }
  }

  const button =
    'rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'

  return (
    <div className="space-y-4">
      <Card title="Vehicles">
        <ul className="mb-3 divide-y divide-slate-100">
          {vehicles.map((v) => (
            <li key={v.id} className="flex items-center gap-3 py-2">
              <button
                onClick={() => onSelectVehicle(v.id)}
                className="flex-1 text-left"
              >
                <span className="font-medium text-slate-900">{v.name}</span>
                {v.id === activeVehicle.id && (
                  <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                    selected
                  </span>
                )}
              </button>
              <button
                onClick={() => rename(v)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Rename
              </button>
              {vehicles.length > 1 && (
                <button
                  onClick={() => remove(v)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const name = newVehicle.trim()
            if (name) {
              onAddVehicle(name)
              setNewVehicle('')
            }
          }}
        >
          <input
            type="text"
            placeholder="e.g. Work Truck"
            className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            value={newVehicle}
            onChange={(e) => setNewVehicle(e.target.value)}
          />
          <button type="submit" className={button} disabled={!newVehicle.trim()}>
            Add
          </button>
        </form>
      </Card>

      <Card title="Units">
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-sm text-slate-500">Distance</p>
            <UnitToggle<DistanceUnit>
              value={settings.distanceUnit}
              options={[
                ['mi', 'Miles'],
                ['km', 'Kilometers'],
              ]}
              onChange={(distanceUnit) =>
                onChangeSettings({ ...settings, distanceUnit })
              }
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm text-slate-500">Volume</p>
            <UnitToggle<VolumeUnit>
              value={settings.volumeUnit}
              options={[
                ['gal', 'Gallons'],
                ['L', 'Liters'],
              ]}
              onChange={(volumeUnit) =>
                onChangeSettings({ ...settings, volumeUnit })
              }
            />
          </div>
          <p className="text-xs text-slate-400">
            Changing units only changes labels — existing entries are not
            converted.
          </p>
        </div>
      </Card>

      <Card title="Export data">
        <p className="mb-3 text-sm text-slate-500">
          Download all {fillUps.length} fill-ups for {activeVehicle.name}.
          Your data is yours — keep a backup or open it in a spreadsheet.
        </p>
        <div className="flex gap-3">
          <button
            className={`${button} flex-1`}
            onClick={exportCsv}
            disabled={fillUps.length === 0}
          >
            Export CSV
          </button>
          <button
            className={`${button} flex-1`}
            onClick={exportJson}
            disabled={fillUps.length === 0}
          >
            Export JSON
          </button>
        </div>
      </Card>

      <Card title="Import data">
        <p className="mb-3 text-sm text-slate-500">
          Add fill-ups to {activeVehicle.name} from a CSV or JSON file
          previously exported from Gas Tracker. Imported entries are added to
          what's already here.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept=".csv,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleFile(file)
            e.target.value = ''
          }}
        />
        <button
          className={`${button} w-full`}
          onClick={() => fileInput.current?.click()}
        >
          Choose file…
        </button>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.kind === 'ok' ? 'text-green-700' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}
      </Card>
    </div>
  )
}
