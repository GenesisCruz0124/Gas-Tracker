import type { FillUp } from '../types'
import { byDateAsc, formatMoney } from '../lib/stats'

interface Props {
  fillUps: FillUp[]
  onEdit: (fillUp: FillUp) => void
  onDelete: (id: string) => void
}

export default function History({ fillUps, onEdit, onDelete }: Props) {
  if (fillUps.length === 0) {
    return (
      <p className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
        No fill-ups yet. Tap “Add Fill-Up” after your next trip to the pump.
      </p>
    )
  }

  const newestFirst = byDateAsc(fillUps).reverse()

  return (
    <ul className="space-y-3">
      {newestFirst.map((f) => (
        <li key={f.id} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">
                {new Date(f.date + 'T00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                {f.station && (
                  <span className="font-normal text-slate-500"> · {f.station}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {f.gallons.toFixed(2)} gal @ {formatMoney(f.pricePerGallon)} ·{' '}
                {f.odometer.toLocaleString()} mi
                {!f.isFullTank && ' · partial'}
              </p>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {formatMoney(f.totalCost)}
            </p>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <button
              onClick={() => onEdit(f)}
              className="font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this fill-up?')) onDelete(f.id)
              }}
              className="font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )
}
