import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export interface PropertyData {
  address: string | null
  coordinates: {
    lat: number
    lng: number
  } | null
  sunHours?: number
}

export interface EnergyData {
  monthlyUsage?: number
  houseSqft?: number
  numAdults?: number
  hasPool?: boolean
  hasEV?: boolean
  heatingType?: "electric" | "gas" | "other"
  estimatedAnnualUsage?: number
}

export interface RoofData {
  roofSizeSqft?: number
  shading?: "none" | "partial" | "heavy"
  panelLayout?: {
    rows: number
    cols: number
  }
  roofOrientation?: string
}

export interface SystemData {
  panelType: string
  panelWattage: number
  inverterType: string
  systemSizeKw: number
  panelCount: number
  annualProductionKwh: number
  costPerWatt: number
  totalCost: number
  offsetPercentage: number
  monthlyProduction: number[]
}

interface ProCalculatorState {
  propertyData: PropertyData
  energyData: EnergyData
  roofData: RoofData
  systemData: Partial<SystemData>
  setPropertyData: (data: Partial<PropertyData>) => void
  setEnergyData: (data: Partial<EnergyData>) => void
  setRoofData: (data: Partial<RoofData>) => void
  setSystemData: (data: Partial<SystemData>) => void
  reset: () => void
}

const initialState: ProCalculatorState = {
  propertyData: {
    address: null,
    coordinates: null,
    sunHours: undefined,
  },
  energyData: {
    monthlyUsage: undefined,
    houseSqft: undefined,
    numAdults: undefined,
    hasPool: undefined,
    hasEV: undefined,
    heatingType: undefined,
    estimatedAnnualUsage: undefined,
  },
  roofData: {
    roofSizeSqft: undefined,
    shading: "none",
    panelLayout: undefined,
    roofOrientation: undefined,
  },
  systemData: {
    panelType: "Silfab 440W",
    panelWattage: 440,
    inverterType: "Enphase IQ8+",
    costPerWatt: 3.5,
  },
}

export const useProCalculatorStore = create<ProCalculatorState>()(
  persist(
    (set) => ({
      ...initialState,
      setPropertyData: (data) => set((state) => ({ propertyData: { ...state.propertyData, ...data } })),
      setEnergyData: (data) => set((state) => ({ energyData: { ...state.energyData, ...data } })),
      setRoofData: (data) => set((state) => ({ roofData: { ...state.roofData, ...data } })),
      setSystemData: (data) => set((state) => ({ systemData: { ...state.systemData, ...data } })),
      reset: () => set(initialState),
    }),
    {
      name: "solar-ai-store-v3",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)

// Exporting with the old name for backward compatibility
export const useSolarCalculatorStore = useProCalculatorStore
export const useStore = useProCalculatorStore
