import { useEffect, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type FillUp,
  type Vehicle,
} from '../types'

const FILLUPS_KEY = 'gas-tracker:fillups'
const VEHICLES_KEY = 'gas-tracker:vehicles'
const SETTINGS_KEY = 'gas-tracker:settings'
const ACTIVE_VEHICLE_KEY = 'gas-tracker:active-vehicle'

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function usePersisted<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(initial)
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])
  return [value, setValue] as const
}

export function useAppData() {
  const [vehicles, setVehicles] = usePersisted<Vehicle[]>(VEHICLES_KEY, () => {
    const stored = loadJson<Vehicle[]>(VEHICLES_KEY, [])
    return stored.length > 0
      ? stored
      : [{ id: crypto.randomUUID(), name: 'My Car' }]
  })

  const defaultVehicleId = vehicles[0].id

  const [fillUps, setFillUps] = usePersisted<FillUp[]>(FILLUPS_KEY, () =>
    // Fill-ups saved before multi-vehicle support have no vehicleId.
    loadJson<FillUp[]>(FILLUPS_KEY, []).map((f) =>
      f.vehicleId ? f : { ...f, vehicleId: defaultVehicleId },
    ),
  )

  const [settings, setSettings] = usePersisted<AppSettings>(SETTINGS_KEY, () =>
    loadJson(SETTINGS_KEY, DEFAULT_SETTINGS),
  )

  const [activeVehicleId, setActiveVehicleId] = usePersisted<string>(
    ACTIVE_VEHICLE_KEY,
    () => loadJson(ACTIVE_VEHICLE_KEY, defaultVehicleId),
  )

  const activeVehicle =
    vehicles.find((v) => v.id === activeVehicleId) ?? vehicles[0]

  const addFillUp = (fillUp: Omit<FillUp, 'id' | 'vehicleId'>) => {
    setFillUps((prev) => [
      ...prev,
      { ...fillUp, id: crypto.randomUUID(), vehicleId: activeVehicle.id },
    ])
  }

  const updateFillUp = (
    id: string,
    changes: Omit<FillUp, 'id' | 'vehicleId'>,
  ) => {
    setFillUps((prev) =>
      prev.map((f) =>
        f.id === id ? { ...changes, id, vehicleId: f.vehicleId } : f,
      ),
    )
  }

  const deleteFillUp = (id: string) => {
    setFillUps((prev) => prev.filter((f) => f.id !== id))
  }

  const importFillUps = (imported: Omit<FillUp, 'id'>[]) => {
    setFillUps((prev) => [
      ...prev,
      ...imported.map((f) => ({
        ...f,
        id: crypto.randomUUID(),
        vehicleId: activeVehicle.id,
      })),
    ])
  }

  const addVehicle = (name: string) => {
    const vehicle = { id: crypto.randomUUID(), name }
    setVehicles((prev) => [...prev, vehicle])
    setActiveVehicleId(vehicle.id)
  }

  const renameVehicle = (id: string, name: string) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, name } : v)))
  }

  /** Removes the vehicle and all of its fill-ups. The last vehicle cannot be deleted. */
  const deleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return
    setFillUps((prev) => prev.filter((f) => f.vehicleId !== id))
    setVehicles((prev) => prev.filter((v) => v.id !== id))
    if (activeVehicleId === id) {
      setActiveVehicleId(vehicles.find((v) => v.id !== id)!.id)
    }
  }

  return {
    fillUps,
    vehicles,
    settings,
    activeVehicle,
    addFillUp,
    updateFillUp,
    deleteFillUp,
    importFillUps,
    addVehicle,
    renameVehicle,
    deleteVehicle,
    setActiveVehicleId,
    setSettings,
  }
}
