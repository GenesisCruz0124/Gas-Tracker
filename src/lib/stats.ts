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

export interface EfficiencyPoint {
  date: string
  distance: number
  volume: number
}

/**
 * Distance/volume for each full-tank-to-full-tank segment, in date order.
 * A segment only counts when both ends are full tanks, since a partial
 * fill makes the volume-to-distance ratio meaningless.
 */
export function efficiencySeries(fillUps: FillUp[]): EfficiencyPoint[] {
  const sorted = byDateAsc(fillUps)
  const points: EfficiencyPoint[] = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const curr = sorted[i]
    if (!curr.isFullTank || !prev.isFullTank) continue
    const distance = curr.odometer - prev.odometer
    if (distance <= 0 || curr.gallons <= 0) continue
    points.push({ date: curr.date, distance, volume: curr.gallons })
  }
  return points
}

/** Total distance and volume across all valid full-tank segments. */
export function efficiencyTotals(
  fillUps: FillUp[],
): { distance: number; volume: number } | null {
  let distance = 0
  let volume = 0
  for (const point of efficiencySeries(fillUps)) {
    distance += point.distance
    volume += point.volume
  }
  return volume > 0 ? { distance, volume } : null
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

/** Total cost divided by total distance driven between first and last fill-up. */
export function costPerDistance(fillUps: FillUp[]): number | null {
  const sorted = byDateAsc(fillUps)
  if (sorted.length < 2) return null
  const distance = sorted[sorted.length - 1].odometer - sorted[0].odometer
  if (distance <= 0) return null
  const cost = sorted.slice(1).reduce((sum, f) => sum + f.totalCost, 0)
  return cost / distance
}

export function formatMoney(amount: number): string {
  return amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })
}
