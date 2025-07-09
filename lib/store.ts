import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PropertyData, EnergyData, AnalysisData } from "@/types/solar"

interface SolarCalculatorState {
  currentStep: number
  isHydrated: boolean
  propertyData: PropertyData
  energyData: EnergyData
  analysisData: AnalysisData
  setCurrentStep: (step: number) => void
  setPropertyData: (data: Partial<PropertyData>) => void
  setEnergyData: (data: Partial<EnergyData>) => void
  setAnalysisData: (data: Partial<AnalysisData>) => void
  reset: () => void
  setHydrated: () => void
}

const initialState: Omit<
  SolarCalculatorState,
  "setCurrentStep" | "setPropertyData" | "setEnergyData" | "setAnalysisData" | "reset" | "setHydrated"
> = {
  currentStep: 1,
  isHydrated: false,
  propertyData: {
    address: null,
    coordinates: null,
    zipCode: null,
    sunHours: null,
  },
  energyData: {
    monthlyUsage: null,
    monthlyBill: null,
    electricityRate: null,
    utilityProvider: null,
    solarProgram: null,
  },
  analysisData: {
    systemSize: null,
    annualProduction: null,
    monthlySavings: null,
    annualSavings: null,
    paybackPeriod: null,
    totalCost: null,
    incentives: null,
    netCost: null,
    co2Reduction: null,
    treesEquivalent: null,
    solarOffsetPercent: null,
    productionKwhPerMonth: null,
    sunlightHours: null,
  },
}

export const useSolarCalculatorStore = create<SolarCalculatorState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setPropertyData: (data) =>
        set((state) => ({
          propertyData: { ...state.propertyData, ...data },
        })),
      setEnergyData: (data) =>
        set((state) => ({
          energyData: { ...state.energyData, ...data },
        })),
      setAnalysisData: (data) =>
        set((state) => ({
          analysisData: { ...state.analysisData, ...data },
        })),
      reset: () => set((state) => ({ ...initialState, isHydrated: state.isHydrated })),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "solar-ai-store",
      version: 2,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    },
  ),
)
