import { useState, type FormEvent } from 'react'
import type { FillUp } from '../types'

interface Props {
  initial?: FillUp
  lastOdometer?: number
  onSave: (fillUp: Omit<FillUp, 'id'>) => void
  onCancel: () => void
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export default function FillUpForm({
  initial,
  lastOdometer,
  onSave,
  onCancel,
}: Props) {
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  )
  const [odometer, setOdometer] = useState(
    initial ? String(initial.odometer) : '',
  )
  const [gallons, setGallons] = useState(
    initial ? String(initial.gallons) : '',
  )
  const [pricePerGallon, setPricePerGallon] = useState(
    initial ? String(initial.pricePerGallon) : '',
  )
  const [totalCost, setTotalCost] = useState(
    initial ? String(initial.totalCost) : '',
  )
  const [station, setStation] = useState(initial?.station ?? '')
  const [isFullTank, setIsFullTank] = useState(initial?.isFullTank ?? true)
  const [error, setError] = useState('')

  // Keep gallons x price and total in sync from whichever two the user typed.
  const syncTotal = (g: string, p: string) => {
    const gal = parseFloat(g)
    const price = parseFloat(p)
    if (gal > 0 && price > 0) setTotalCost(String(round2(gal * price)))
  }
  const syncPrice = (g: string, t: string) => {
    const gal = parseFloat(g)
    const total = parseFloat(t)
    if (gal > 0 && total > 0) setPricePerGallon(String(round2(total / gal)))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const odo = parseFloat(odometer)
    const gal = parseFloat(gallons)
    const price = parseFloat(pricePerGallon)
    const total = parseFloat(totalCost)

    if (!date || !(odo > 0) || !(gal > 0) || !(total > 0)) {
      setError('Date, odometer, gallons, and total cost are required.')
      return
    }
    if (
      lastOdometer !== undefined &&
      initial === undefined &&
      odo <= lastOdometer
    ) {
      setError(
        `Odometer should be above your last reading (${lastOdometer.toLocaleString()} mi).`,
      )
      return
    }

    onSave({
      date,
      odometer: odo,
      gallons: gal,
      pricePerGallon: price > 0 ? price : round2(total / gal),
      totalCost: total,
      station: station.trim() || undefined,
      isFullTank,
    })
  }

  const field =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none'
  const label = 'block text-sm font-medium text-slate-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">
        {initial ? 'Edit fill-up' : 'Add fill-up'}
      </h2>

      <div>
        <label className={label} htmlFor="date">Date</label>
        <input
          id="date"
          type="date"
          className={field}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className={label} htmlFor="odometer">Odometer (mi)</label>
        <input
          id="odometer"
          type="number"
          inputMode="decimal"
          step="any"
          className={field}
          placeholder={
            lastOdometer !== undefined
              ? `Last: ${lastOdometer.toLocaleString()}`
              : 'e.g. 48210'
          }
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={label} htmlFor="gallons">Gallons</label>
          <input
            id="gallons"
            type="number"
            inputMode="decimal"
            step="any"
            className={field}
            value={gallons}
            onChange={(e) => {
              setGallons(e.target.value)
              syncTotal(e.target.value, pricePerGallon)
            }}
          />
        </div>
        <div>
          <label className={label} htmlFor="price">$/gal</label>
          <input
            id="price"
            type="number"
            inputMode="decimal"
            step="any"
            className={field}
            value={pricePerGallon}
            onChange={(e) => {
              setPricePerGallon(e.target.value)
              syncTotal(gallons, e.target.value)
            }}
          />
        </div>
        <div>
          <label className={label} htmlFor="total">Total $</label>
          <input
            id="total"
            type="number"
            inputMode="decimal"
            step="any"
            className={field}
            value={totalCost}
            onChange={(e) => {
              setTotalCost(e.target.value)
              syncPrice(gallons, e.target.value)
            }}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="station">Station (optional)</label>
        <input
          id="station"
          type="text"
          className={field}
          placeholder="e.g. Shell on Main St"
          value={station}
          onChange={(e) => setStation(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={isFullTank}
          onChange={(e) => setIsFullTank(e.target.checked)}
        />
        Filled the tank completely (needed for MPG)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
