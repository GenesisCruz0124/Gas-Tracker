import { useEffect, useState } from 'react'
import type { FillUp } from '../types'

const STORAGE_KEY = 'gas-tracker:fillups'

function load(): FillUp[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FillUp[]) : []
  } catch {
    return []
  }
}

export function useFillUps() {
  const [fillUps, setFillUps] = useState<FillUp[]>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fillUps))
  }, [fillUps])

  const addFillUp = (fillUp: Omit<FillUp, 'id'>) => {
    setFillUps((prev) => [...prev, { ...fillUp, id: crypto.randomUUID() }])
  }

  const updateFillUp = (id: string, changes: Omit<FillUp, 'id'>) => {
    setFillUps((prev) =>
      prev.map((f) => (f.id === id ? { ...changes, id } : f)),
    )
  }

  const deleteFillUp = (id: string) => {
    setFillUps((prev) => prev.filter((f) => f.id !== id))
  }

  return { fillUps, addFillUp, updateFillUp, deleteFillUp }
}
