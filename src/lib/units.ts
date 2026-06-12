import type { AppSettings } from '../types'

export function volumeLabel(s: AppSettings): string {
  return s.volumeUnit === 'gal' ? 'gal' : 'L'
}

export function volumeWord(s: AppSettings): string {
  return s.volumeUnit === 'gal' ? 'Gallons' : 'Liters'
}

export function priceLabel(s: AppSettings): string {
  return `$/${volumeLabel(s)}`
}

export function isMetricEfficiency(s: AppSettings): boolean {
  return s.distanceUnit === 'km' && s.volumeUnit === 'L'
}

export function efficiencyLabel(s: AppSettings): string {
  if (s.distanceUnit === 'mi' && s.volumeUnit === 'gal') return 'MPG'
  if (isMetricEfficiency(s)) return 'L/100km'
  return `${s.distanceUnit}/${volumeLabel(s)}`
}

/**
 * Fuel efficiency from total distance and volume. Metric users expect
 * liters per 100 km (lower is better); everyone else gets distance per
 * volume (higher is better).
 */
export function efficiency(
  distance: number,
  volume: number,
  s: AppSettings,
): number {
  return isMetricEfficiency(s) ? (volume / distance) * 100 : distance / volume
}
