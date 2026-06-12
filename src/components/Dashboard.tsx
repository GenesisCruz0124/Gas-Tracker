import type { AppSettings, FillUp } from '../types'
import {
  costPerDistance,
  efficiencyTotals,
  formatMoney,
  monthKey,
  totalForMonth,
} from '../lib/stats'
import { efficiency, efficiencyLabel } from '../lib/units'

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export default function Dashboard({
  fillUps,
  settings,
}: {
  fillUps: FillUp[]
  settings: AppSettings
}) {
  const now = new Date()
  const thisMonth = monthKey(now.toISOString())
  const monthName = now.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const monthTotal = totalForMonth(fillUps, thisMonth)
  const totals = efficiencyTotals(fillUps)
  const cpd = costPerDistance(fillUps)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={`Spent in ${monthName}`} value={formatMoney(monthTotal)} />
        <StatCard label="Fill-ups logged" value={String(fillUps.length)} />
        <StatCard
          label={`Average ${efficiencyLabel(settings)}`}
          value={
            totals
              ? efficiency(totals.distance, totals.volume, settings).toFixed(1)
              : '—'
          }
        />
        <StatCard
          label={`Cost per ${settings.distanceUnit}`}
          value={cpd !== null ? formatMoney(cpd) : '—'}
        />
      </div>
      {fillUps.length < 2 && (
        <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
          Log at least two full-tank fill-ups to see your fuel economy and
          cost per {settings.distanceUnit === 'mi' ? 'mile' : 'kilometer'}.
        </p>
      )}
    </div>
  )
}
