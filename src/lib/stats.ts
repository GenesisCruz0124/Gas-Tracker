import type { FillUp } from '../types'

export function byDateAsc(fillUps: FillUp[]): FillUp[] {
  return [...fillUps].sort(
    (a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer,
  )
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7) // yyyy-mm
}

export function totalForMonth(fillUps: FillUp[], month: string): number {
  return fillUps
    .filter((f) => monthKey(f.date) === month)
    .reduce((sum, f) => sum + f.totalCost, 0)
}

/**
 * Average MPG across consecutive full-tank fill-ups, weighted by miles
 * driven. A segment only counts when the later fill-up is a full tank,
 * since a partial fill makes the gallons-to-miles ratio meaningless.
 */
export function averageMpg(fillUps: FillUp[]): number | null {
  const sorted = byDateAsc(fillUps)
  let miles = 0
  let gallons = 0
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (!curr.isFullTank || !prev.isFullTank) continue
    const distance = curr.odometer - prev.odometer
    if (distance <= 0 || curr.gallons <= 0) continue
    miles += distance
    gallons += curr.gallons
  }
  return gallons > 0 ? miles / gallons : null
}

/** Total cost divided by total miles driven between first and last fill-up. */
export function costPerMile(fillUps: FillUp[]): number | null {
  const sorted = byDateAsc(fillUps)
  if (sorted.length < 2) return null
  const miles = sorted[sorted.length - 1].odometer - sorted[0].odometer
  if (miles <= 0) return null
  const cost = sorted.slice(1).reduce((sum, f) => sum + f.totalCost, 0)
  return cost / miles
}

export interface MonthlyTotal {
  month: string // yyyy-mm
  total: number
}

export function monthlyTotals(fillUps: FillUp[]): MonthlyTotal[] {
  const totals = new Map<string, number>()
  for (const f of fillUps) {
    const key = monthKey(f.date)
    totals.set(key, (totals.get(key) ?? 0) + f.totalCost)
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
}

export interface MpgPoint {
  date: string
  mpg: number
}

/** MPG for each full-tank-to-full-tank segment, in date order. */
export function mpgSeries(fillUps: FillUp[]): MpgPoint[] {
  const sorted = byDateAsc(fillUps)
  const points: MpgPoint[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (!curr.isFullTank || !prev.isFullTank) continue
    const distance = curr.odometer - prev.odometer
    if (distance <= 0 || curr.gallons <= 0) continue
    points.push({ date: curr.date, mpg: distance / curr.gallons })
  }
  return points
}

export interface PricePoint {
  date: string
  price: number
}

export function priceSeries(fillUps: FillUp[]): PricePoint[] {
  return byDateAsc(fillUps)
    .filter((f) => f.pricePerGallon > 0)
    .map((f) => ({ date: f.date, price: f.pricePerGallon }))
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
