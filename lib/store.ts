import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PropertyData {
  address: string
  coordinates: { lat: number; lng: number } | null
  propertyImages: {
    front: string
    right: string
    left: string
    aerial: string
  } | null
}

interface EnergyData {
  usage: number
  bill: number
  provider: string
  rate: number | null
  extractedText: string
  uploadedFileName: string
}

interface AnalysisData {
  roofScore: number
  sunlightHours: number
  suitabilityScore: number
  recommendations: string[]
  advantages: string[]
  considerations: string[]
}

interface ProCalculatorState {
  currentStep: number
  propertyData: PropertyData
  energyData: EnergyData
  analysisData: AnalysisData | null

  // Actions
  setCurrentStep: (step: number) => void
  setPropertyData: (data: Partial<PropertyData>) => void
  setEnergyData: (data: Partial<EnergyData>) => void
  setAnalysisData: (data: AnalysisData) => void
  resetStore: () => void
}

const initialState = {
  currentStep: 1,
  propertyData: {
    address: "",
    coordinates: null,
    propertyImages: null,
  },
  energyData: {
    usage: 0,
    bill: 0,
    provider: "",
    rate: null,
    extractedText: "",
    uploadedFileName: "",
  },
  analysisData: null,
}

export const useProCalculatorStore = create<ProCalculatorState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step: number) => set({ currentStep: step }),

      setPropertyData: (data: Partial<PropertyData>) =>
        set((state) => ({
          propertyData: { ...state.propertyData, ...data },
        })),

      setEnergyData: (data: Partial<EnergyData>) =>
        set((state) => {
          const newEnergyData = { ...state.energyData, ...data }

          // Auto-calculate rate if usage and bill are available
          if (newEnergyData.usage > 0 && newEnergyData.bill > 0) {
            newEnergyData.rate = newEnergyData.bill / newEnergyData.usage
          }

          return { energyData: newEnergyData }
        }),

      setAnalysisData: (data: AnalysisData) => set({ analysisData: data }),

      resetStore: () => set(initialState),
    }),
    {
      name: "pro-calculator-storage",
      partialize: (state) => ({
        currentStep: state.currentStep,
        propertyData: state.propertyData,
        energyData: state.energyData,
        analysisData: state.analysisData,
      }),
    },
  ),
)
