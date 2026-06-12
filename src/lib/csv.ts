import type { FillUp } from '../types'

const COLUMNS = [
  'date',
  'odometer',
  'gallons',
  'pricePerGallon',
  'totalCost',
  'station',
  'isFullTank',
  'notes',
] as const

function escapeCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
}

export function toCsv(fillUps: FillUp[]): string {
  const rows = fillUps.map((f) =>
    COLUMNS.map((col) => {
      const value = f[col]
      if (value === undefined) return ''
      return escapeCell(String(value))
    }).join(','),
  )
  return [COLUMNS.join(','), ...rows].join('\n')
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(cell)
      cell = ''
    } else {
      cell += ch
    }
  }
  cells.push(cell)
  return cells
}

export function fromCsv(text: string): Omit<FillUp, 'id'>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lines.length < 2) throw new Error('CSV has no data rows.')
  const header = splitCsvLine(lines[0]).map((h) => h.trim())
  const index = (name: string) => header.indexOf(name)
  for (const required of ['date', 'odometer', 'gallons', 'totalCost']) {
    if (index(required) === -1) {
      throw new Error(`CSV is missing the "${required}" column.`)
    }
  }
  return lines.slice(1).map((line, n) => {
    const cells = splitCsvLine(line)
    const get = (name: string) => cells[index(name)]?.trim() ?? ''
    const num = (name: string) => parseFloat(get(name))
    const fillUp: Omit<FillUp, 'id'> = {
      date: get('date'),
      odometer: num('odometer'),
      gallons: num('gallons'),
      pricePerGallon: num('pricePerGallon') || 0,
      totalCost: num('totalCost'),
      station: get('station') || undefined,
      isFullTank: get('isFullTank') !== 'false',
      notes: get('notes') || undefined,
    }
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fillUp.date) ||
      !(fillUp.odometer > 0) ||
      !(fillUp.gallons > 0) ||
      !(fillUp.totalCost > 0)
    ) {
      throw new Error(`Row ${n + 2} has invalid or missing values.`)
    }
    return fillUp
  })
}

export function fromJson(text: string): Omit<FillUp, 'id'>[] {
  const data: unknown = JSON.parse(text)
  if (!Array.isArray(data)) throw new Error('JSON must be an array of fill-ups.')
  return data.map((item, n) => {
    const f = item as Partial<FillUp>
    if (
      typeof f.date !== 'string' ||
      typeof f.odometer !== 'number' ||
      typeof f.gallons !== 'number' ||
      typeof f.totalCost !== 'number'
    ) {
      throw new Error(`Entry ${n + 1} is missing required fields.`)
    }
    return {
      date: f.date,
      odometer: f.odometer,
      gallons: f.gallons,
      pricePerGallon: typeof f.pricePerGallon === 'number' ? f.pricePerGallon : 0,
      totalCost: f.totalCost,
      station: f.station || undefined,
      isFullTank: f.isFullTank !== false,
      notes: f.notes || undefined,
    }
  })
}

export function downloadFile(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}
