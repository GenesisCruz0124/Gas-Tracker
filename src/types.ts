export interface FillUp {
  id: string
  date: string // ISO date (yyyy-mm-dd)
  odometer: number // in the configured distance unit
  gallons: number // volume in the configured volume unit
  pricePerGallon: number // price per configured volume unit
  totalCost: number
  station?: string
  isFullTank: boolean
  notes?: string
  vehicleId?: string
}

export interface Vehicle {
  id: string
  name: string
}

export type DistanceUnit = 'mi' | 'km'
export type VolumeUnit = 'gal' | 'L'

export interface AppSettings {
  distanceUnit: DistanceUnit
  volumeUnit: VolumeUnit
}

export const DEFAULT_SETTINGS: AppSettings = {
  distanceUnit: 'mi',
  volumeUnit: 'gal',
}
