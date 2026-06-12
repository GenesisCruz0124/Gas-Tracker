import { useRef, useState } from 'react'
import type { FillUp } from '../types'
import { downloadFile, fromCsv, fromJson, toCsv } from '../lib/csv'

interface Props {
  fillUps: FillUp[]
  onImport: (fillUps: Omit<FillUp, 'id'>[]) => void
}

export default function Settings({ fillUps, onImport }: Props) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{
    kind: 'ok' | 'error'
    text: string
  } | null>(null)

  const stamp = new Date().toISOString().slice(0, 10)

  const exportCsv = () =>
    downloadFile(`gas-tracker-${stamp}.csv`, toCsv(fillUps), 'text/csv')
  const exportJson = () =>
    downloadFile(
      `gas-tracker-${stamp}.json`,
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
        text: `Imported ${imported.length} fill-up${imported.length === 1 ? '' : 's'}.`,
      })
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Could not read that file.',
      })
    }
  }

  const button =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50'

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">
          Export data
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          Download all {fillUps.length} fill-ups. Your data is yours — keep a
          backup or open it in a spreadsheet.
        </p>
        <div className="flex gap-3">
          <button className={button} onClick={exportCsv} disabled={fillUps.length === 0}>
            Export CSV
          </button>
          <button className={button} onClick={exportJson} disabled={fillUps.length === 0}>
            Export JSON
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">
          Import data
        </h2>
        <p className="mb-3 text-sm text-slate-500">
          Add fill-ups from a CSV or JSON file previously exported from Gas
          Tracker. Imported entries are added to what's already here.
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
        <button className={button} onClick={() => fileInput.current?.click()}>
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
      </div>
    </div>
  )
}
