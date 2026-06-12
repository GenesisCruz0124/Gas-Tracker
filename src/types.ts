export interface FillUp {
  id: string
  date: string // ISO date (yyyy-mm-dd)
  odometer: number // miles at fill-up
  gallons: number
  pricePerGallon: number
  totalCost: number
  station?: string
  isFullTank: boolean
  notes?: string
}
