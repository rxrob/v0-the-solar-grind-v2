"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  Zap,
  DollarSign,
  Building2,
  AlertTriangle,
  Info,
  Download,
  ExternalLink,
  MapPin,
  Calculator,
} from "lucide-react"
import { Label } from "@/components/ui/label" // Import Label component

interface TexasUtility {
  id: string
  name: string
  type: "cooperative" | "deregulated_tdu" | "municipal"
  region: string
  netMeteringPolicy: "full" | "avoided_cost" | "none"
  buybackRate: number // $/kWh
  buybackPercentage: number // % of retail rate
  retailRate: number // $/kWh
  monthlyFee: number // $ additional fee for solar
  connectionFee: number // $ base monthly fee
  demandCharges: boolean
  description: string
  notes?: string
  website?: string
}

const TEXAS_UTILITIES: TexasUtility[] = [
  // Electric Cooperatives
  {
    id: "bailey-county-ec",
    name: "Bailey County Electric Cooperative",
    type: "cooperative",
    region: "West Texas",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.08,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Allows interconnection but does not credit surplus to grid",
    notes: "Excess energy is donated to the cooperative",
  },
  {
    id: "bandera-ec",
    name: "Bandera Electric Cooperative",
    type: "cooperative",
    region: "Hill Country",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0343,
    buybackPercentage: 43,
    retailRate: 0.0793,
    monthlyFee: 0,
    connectionFee: 20,
    demandCharges: false,
    description: "Avoided-cost buyback at 43% of retail rate",
  },
  {
    id: "bartlett-ec",
    name: "Bartlett Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.118,
    buybackPercentage: 100,
    retailRate: 0.118,
    monthlyFee: 0,
    connectionFee: 22,
    demandCharges: false,
    description: "Full net metering with 1:1 credit for surplus",
  },
  {
    id: "big-country-ec",
    name: "Big Country Electric Cooperative",
    type: "cooperative",
    region: "West Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0567,
    buybackPercentage: 49,
    retailRate: 0.1147,
    monthlyFee: 0,
    connectionFee: 28,
    demandCharges: false,
    description: "Avoided-cost policy at 49% of retail rate",
  },
  {
    id: "bluebonnet-ec",
    name: "Bluebonnet Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0616,
    buybackPercentage: 64,
    retailRate: 0.096,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost compensation at 64% of retail rate",
  },
  {
    id: "bowie-cass-ec",
    name: "Bowie-Cass Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.1448,
    buybackPercentage: 100,
    retailRate: 0.1448,
    monthlyFee: 15,
    connectionFee: 20,
    demandCharges: false,
    description: "Full net metering with additional $15/month DG fee",
  },
  {
    id: "central-texas-ec",
    name: "Central Texas Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.112,
    buybackPercentage: 100,
    retailRate: 0.112,
    monthlyFee: 15,
    connectionFee: 25,
    demandCharges: false,
    description: "Net metering with $15/month DG fee",
  },
  {
    id: "cherokee-county-ec",
    name: "Cherokee County Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.1293,
    buybackPercentage: 100,
    retailRate: 0.1293,
    monthlyFee: 15,
    connectionFee: 22,
    demandCharges: false,
    description: "Net metering with 1:1 credit plus $15/month fee",
  },
  {
    id: "coleman-county-ec",
    name: "Coleman County Electric Cooperative",
    type: "cooperative",
    region: "West Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.084,
    buybackPercentage: 100,
    retailRate: 0.084,
    monthlyFee: 0,
    connectionFee: 24,
    demandCharges: false,
    description: "Full retail credit for exports, no additional fees",
  },
  {
    id: "comanche-county-ec",
    name: "Comanche County Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.053,
    buybackPercentage: 39,
    retailRate: 0.135,
    monthlyFee: 0,
    connectionFee: 26,
    demandCharges: false,
    description: "Avoided-cost credit at 39% of retail rate",
  },
  {
    id: "concho-valley-ec",
    name: "Concho Valley Electric Cooperative",
    type: "cooperative",
    region: "West Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 50,
    retailRate: 0.12,
    monthlyFee: 15.25,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost buyback with $15.25/month solar charge",
  },
  {
    id: "cooke-county-ec",
    name: "Cooke County Electric Cooperative (PenTex Energy)",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0815,
    buybackPercentage: 51,
    retailRate: 0.16,
    monthlyFee: 10,
    connectionFee: 28,
    demandCharges: false,
    description: "Avoided-cost compensation with $10/month DG fee",
  },
  {
    id: "deep-east-texas-ec",
    name: "Deep East Texas Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0439,
    buybackPercentage: 39,
    retailRate: 0.1125,
    monthlyFee: 10,
    connectionFee: 22,
    demandCharges: false,
    description: "Avoided-cost policy with $10/month DER fee",
  },
  {
    id: "denton-county-ec",
    name: "Denton County Electric Cooperative (CoServ)",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0663,
    buybackPercentage: 58,
    retailRate: 0.1151,
    monthlyFee: 25,
    connectionFee: 30,
    demandCharges: false,
    description: "Avoided-cost buyback with $25/month solar metering fee",
  },
  {
    id: "fannin-county-ec",
    name: "Fannin County Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0719,
    buybackPercentage: 55,
    retailRate: 0.131,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost buyback at 55% of retail rate",
  },
  {
    id: "farmers-ec-tx",
    name: "Farmers Electric Cooperative (Texas)",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 56,
    retailRate: 0.107,
    monthlyFee: 5,
    connectionFee: 24,
    demandCharges: false,
    description: "No net metering for new solar, avoided-cost only",
    notes: "Explicitly states no 1:1 net metering for new installations",
  },
  {
    id: "fayette-ec",
    name: "Fayette Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0428,
    buybackPercentage: 44,
    retailRate: 0.097,
    monthlyFee: 6,
    connectionFee: 23,
    demandCharges: false,
    description: "Avoided-cost policy with $0.75/kW capacity fee",
    notes: "DG fee calculated as $0.75 per kW of solar capacity",
  },
  {
    id: "fort-belknap-ec",
    name: "Fort Belknap Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.07,
    buybackPercentage: 50,
    retailRate: 0.14,
    monthlyFee: 33.5,
    connectionFee: 35,
    demandCharges: false,
    description: "Avoided-cost buyback with very high $33.50/month solar fee",
    notes: "Solar fee effectively doubles the standard customer charge",
  },
  {
    id: "grayson-collin-ec",
    name: "Grayson-Collin Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.127,
    buybackPercentage: 100,
    retailRate: 0.127,
    monthlyFee: 5,
    connectionFee: 28,
    demandCharges: false,
    description: "Net metering with modest $5/month DG fee",
  },
  {
    id: "greenbelt-ec",
    name: "Greenbelt Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.047,
    buybackPercentage: 33,
    retailRate: 0.14,
    monthlyFee: 0,
    connectionFee: 30,
    demandCharges: false,
    description: "Avoided-cost policy at 33% of retail rate",
  },
  {
    id: "gvec",
    name: "Guadalupe Valley Electric Cooperative (GVEC)",
    type: "cooperative",
    region: "South Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.085,
    buybackPercentage: 79,
    retailRate: 0.1076,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost buyback at 79% of retail rate",
    notes: "Credits close to retail but not full 1:1",
  },
  {
    id: "hamilton-county-ec",
    name: "Hamilton County Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0354,
    buybackPercentage: 27,
    retailRate: 0.1307,
    monthlyFee: 0,
    connectionFee: 26,
    demandCharges: false,
    description: "Low avoided-cost rate at only 27% of retail",
  },
  {
    id: "heart-of-texas-ec",
    name: "Heart of Texas Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0481,
    buybackPercentage: 36,
    retailRate: 0.1336,
    monthlyFee: 0,
    connectionFee: 28,
    demandCharges: false,
    description: "Ended net metering for new installs, avoided-cost only",
    notes: "Confirms no net metering for new solar installations",
  },
  {
    id: "hilco-ec",
    name: "HILCO Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.1337,
    buybackPercentage: 100,
    retailRate: 0.1337,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Full retail credit for excess with no additional charges",
  },
  {
    id: "houston-county-ec",
    name: "Houston County Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.059,
    buybackPercentage: 39,
    retailRate: 0.151,
    monthlyFee: 15,
    connectionFee: 24,
    demandCharges: false,
    description: "Avoided-cost policy with $15/month DG charge",
  },
  {
    id: "jac-ec",
    name: "J-A-C Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.125,
    monthlyFee: 11.5,
    connectionFee: 22,
    demandCharges: false,
    description: "No net metering policy, no buyback for excess",
    notes: "Surplus generation is not compensated, charges fee for solar",
  },
  {
    id: "jasper-newton-ec",
    name: "Jasper-Newton Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.125,
    buybackPercentage: 100,
    retailRate: 0.125,
    monthlyFee: 15,
    connectionFee: 23,
    demandCharges: false,
    description: "Net metering with 1:1 credit and $15/month DG fee",
  },
  {
    id: "karnes-ec",
    name: "Karnes Electric Cooperative",
    type: "cooperative",
    region: "South Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.015,
    buybackPercentage: 14,
    retailRate: 0.1051,
    monthlyFee: 0,
    connectionFee: 24,
    demandCharges: false,
    description: "Very low avoided-cost rate at only 14% of retail",
  },
  {
    id: "lamar-county-ec",
    name: "Lamar County Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 48,
    retailRate: 0.125,
    monthlyFee: 12.5,
    connectionFee: 26,
    demandCharges: false,
    description: "Avoided-cost policy with $12.50/month DG fee",
  },
  {
    id: "lamb-county-ec",
    name: "Lamb County Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.04,
    buybackPercentage: 50,
    retailRate: 0.08,
    monthlyFee: 0,
    connectionFee: 28,
    demandCharges: false,
    description: "Avoided-cost compensation at 50% of retail rate",
  },
  {
    id: "lighthouse-ec",
    name: "Lighthouse Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "none",
    buybackRate: 0.0,
    buybackPercentage: 0,
    retailRate: 0.095,
    monthlyFee: 0,
    connectionFee: 32,
    demandCharges: false,
    description: "No net metering policy, no credit for surplus",
    notes: "Energy sent to grid is uncompensated",
  },
  {
    id: "lyntegar-ec",
    name: "Lyntegar Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.046,
    buybackPercentage: 51,
    retailRate: 0.09,
    monthlyFee: 0,
    connectionFee: 29,
    demandCharges: false,
    description: "Avoided-cost policy at 51% of retail rate",
  },
  {
    id: "magic-valley-ec",
    name: "Magic Valley Electric Cooperative",
    type: "cooperative",
    region: "South Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.111,
    buybackPercentage: 100,
    retailRate: 0.111,
    monthlyFee: 0,
    connectionFee: 26,
    demandCharges: false,
    description: "Full retail credit for surplus generation",
  },
  {
    id: "medina-ec",
    name: "Medina Electric Cooperative",
    type: "cooperative",
    region: "Hill Country",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0499,
    buybackPercentage: 46,
    retailRate: 0.1083,
    monthlyFee: 0,
    connectionFee: 24,
    demandCharges: false,
    description: "Avoided-cost buyback at 46% of retail rate",
  },
  {
    id: "navarro-county-ec",
    name: "Navarro County Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.051,
    buybackPercentage: 39,
    retailRate: 0.13,
    monthlyFee: 0,
    connectionFee: 27,
    demandCharges: false,
    description: "Avoided-cost policy at 39% of retail rate",
  },
  {
    id: "navasota-valley-ec",
    name: "Navasota Valley Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.11,
    buybackPercentage: 100,
    retailRate: 0.11,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Full 100% credit for surplus generation",
  },
  {
    id: "north-plains-ec",
    name: "North Plains Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "full",
    buybackRate: 0.0973,
    buybackPercentage: 100,
    retailRate: 0.0973,
    monthlyFee: 18,
    connectionFee: 30,
    demandCharges: false,
    description: "Avoided-cost rate equals retail rate, effectively net metering",
    notes: "100% credit tied to wholesale price, $18/month DG meter fee",
  },
  {
    id: "nueces-ec",
    name: "Nueces Electric Cooperative",
    type: "cooperative",
    region: "Coastal Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0625,
    buybackPercentage: 42,
    retailRate: 0.15,
    monthlyFee: 19.5,
    connectionFee: 28,
    demandCharges: false,
    description: "Avoided-cost buyback with $19.50/month solar fee",
  },
  {
    id: "panola-harrison-ec",
    name: "Panola-Harrison Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0573,
    buybackPercentage: 65,
    retailRate: 0.088,
    monthlyFee: 0,
    connectionFee: 23,
    demandCharges: false,
    description: "Avoided-cost policy at 65% of retail rate",
  },
  {
    id: "pec",
    name: "Pedernales Electric Cooperative (PEC)",
    type: "cooperative",
    region: "Hill Country",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.06,
    buybackPercentage: 58,
    retailRate: 0.1038,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost buyback at cooperative's avoided power cost",
    notes: "Does not offer full retail net metering",
  },
  {
    id: "rio-grande-ec",
    name: "Rio Grande Electric Cooperative",
    type: "cooperative",
    region: "South Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.055,
    buybackPercentage: 39,
    retailRate: 0.141,
    monthlyFee: 0,
    connectionFee: 38.75,
    demandCharges: false,
    description: "Avoided-cost policy with high base charge but no solar fee",
  },
  {
    id: "rusk-county-ec",
    name: "Rusk County Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.066,
    buybackPercentage: 63,
    retailRate: 0.105,
    monthlyFee: 0,
    connectionFee: 24,
    demandCharges: false,
    description: "Avoided-cost buyback at 63% of retail rate",
  },
  {
    id: "sam-houston-ec",
    name: "Sam Houston Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.045,
    buybackPercentage: 35,
    retailRate: 0.129,
    monthlyFee: 0,
    connectionFee: 26,
    demandCharges: false,
    description: "Avoided-cost policy, no full net metering",
    notes: "Buyback rider at avoided-cost rates (4-5¢/kWh in 2023)",
  },
  {
    id: "san-bernard-ec",
    name: "San Bernard Electric Cooperative",
    type: "cooperative",
    region: "Coastal Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0655,
    buybackPercentage: 47,
    retailRate: 0.14,
    monthlyFee: 0,
    connectionFee: 27,
    demandCharges: false,
    description: "Avoided-cost policy at 47% of retail rate",
  },
  {
    id: "san-patricio-ec",
    name: "San Patricio Electric Cooperative",
    type: "cooperative",
    region: "Coastal Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.141,
    buybackPercentage: 100,
    retailRate: 0.141,
    monthlyFee: 12,
    connectionFee: 28,
    demandCharges: false,
    description: "Net metering with full 1:1 credit and $12/month DG fee",
  },
  {
    id: "south-plains-ec",
    name: "South Plains Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "full",
    buybackRate: 0.0974,
    buybackPercentage: 100,
    retailRate: 0.0974,
    monthlyFee: 11.47,
    connectionFee: 29,
    demandCharges: false,
    description: "Net metering with 100% credit and $11.47/month solar charge",
  },
  {
    id: "southwest-rural-ea",
    name: "Southwest Rural Electric Association",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.03,
    buybackPercentage: 24,
    retailRate: 0.125,
    monthlyFee: 24,
    connectionFee: 32,
    demandCharges: false,
    description: "Low avoided-cost rate with $24/month solar fee",
  },
  {
    id: "southwest-texas-ec",
    name: "Southwest Texas Electric Cooperative",
    type: "cooperative",
    region: "West Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.035,
    buybackPercentage: 34,
    retailRate: 0.103,
    monthlyFee: 0,
    connectionFee: 26,
    demandCharges: false,
    description: "Avoided-cost buyback at 34% of retail rate",
  },
  {
    id: "swisher-ec",
    name: "Swisher Electric Cooperative",
    type: "cooperative",
    region: "Panhandle",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.024,
    buybackPercentage: 26,
    retailRate: 0.092,
    monthlyFee: 15,
    connectionFee: 31,
    demandCharges: false,
    description: "Low avoided-cost rate with $15/month DG fee",
  },
  {
    id: "taylor-ec",
    name: "Taylor Electric Cooperative",
    type: "cooperative",
    region: "Central Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.025,
    buybackPercentage: 20,
    retailRate: 0.125,
    monthlyFee: 0,
    connectionFee: 39.95,
    demandCharges: false,
    description: "Very low avoided-cost rate at only 20% of retail",
    notes: "High base fee but no additional solar charge",
  },
  {
    id: "tri-county-ec",
    name: "Tri-County Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.1443,
    buybackPercentage: 100,
    retailRate: 0.1443,
    monthlyFee: 12,
    connectionFee: 25,
    demandCharges: false,
    description: "Net metering with full retail credit and $12/month solar rider",
    notes: "Openly promotes solar buyback program",
  },
  {
    id: "trinity-valley-ec",
    name: "Trinity Valley Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0768,
    buybackPercentage: 73,
    retailRate: 0.1048,
    monthlyFee: 0,
    connectionFee: 24,
    demandCharges: false,
    description: "Avoided-cost policy at 73% of retail rate",
  },
  {
    id: "united-electric-coop",
    name: "United Electric Cooperative Services",
    type: "cooperative",
    region: "South Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.14,
    buybackPercentage: 100,
    retailRate: 0.14,
    monthlyFee: 18.5,
    connectionFee: 27,
    demandCharges: false,
    description: "Net metering with 1:1 credit and $18.50/month solar metering fee",
  },
  {
    id: "upshur-rural-ec",
    name: "Upshur Rural Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.105,
    buybackPercentage: 100,
    retailRate: 0.105,
    monthlyFee: 0,
    connectionFee: 23,
    demandCharges: false,
    description: "Net metering with full credit, no additional DG fees",
  },
  {
    id: "victoria-ec",
    name: "Victoria Electric Cooperative",
    type: "cooperative",
    region: "Coastal Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.04,
    buybackPercentage: 41,
    retailRate: 0.0981,
    monthlyFee: 10,
    connectionFee: 26,
    demandCharges: false,
    description: "Avoided-cost buyback with $10/month solar charge",
  },
  {
    id: "wharton-county-ec",
    name: "Wharton County Electric Cooperative",
    type: "cooperative",
    region: "Coastal Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.0469,
    buybackPercentage: 32,
    retailRate: 0.1468,
    monthlyFee: 15,
    connectionFee: 28,
    demandCharges: false,
    description: "Avoided-cost policy with $15/month DG customer charge",
  },
  {
    id: "wise-ec",
    name: "Wise Electric Cooperative",
    type: "cooperative",
    region: "North Texas",
    netMeteringPolicy: "full",
    buybackRate: 0.13,
    buybackPercentage: 100,
    retailRate: 0.13,
    monthlyFee: 10,
    connectionFee: 27,
    demandCharges: false,
    description: "Net metering with full retail credit and $10/month solar rider",
  },
  {
    id: "wood-county-ec",
    name: "Wood County Electric Cooperative",
    type: "cooperative",
    region: "East Texas",
    netMeteringPolicy: "avoided_cost",
    buybackRate: 0.091,
    buybackPercentage: 69,
    retailRate: 0.1317,
    monthlyFee: 0,
    connectionFee: 25,
    demandCharges: false,
    description: "Avoided-cost policy at 69% of retail rate",
  },

  // Deregulated TDUs
  {
    id: "oncor",
    name: "Oncor Electric Delivery",
    type: "deregulated_tdu",
    region: "North/Central Texas (Dallas-Fort Worth)",
    netMeteringPolicy: "full",
    buybackRate: 0.12,
    buybackPercentage: 100,
    retailRate: 0.12,
    monthlyFee: 0,
    connectionFee: 15,
    demandCharges: false,
    description: "TDU only - net metering through REP solar plans",
    notes: "Must choose REP with solar buyback plan for 1:1 credit. Oncor offers solar+battery rebates.",
    website: "https://www.oncor.com/solar",
  },
  {
    id: "centerpoint",
    name: "CenterPoint Energy",
    type: "deregulated_tdu",
    region: "Houston Area",
    netMeteringPolicy: "full",
    buybackRate: 0.11,
    buybackPercentage: 100,
    retailRate: 0.11,
    monthlyFee: 0,
    connectionFee: 12,
    demandCharges: false,
    description: "TDU only - compensation through REP solar plans",
    notes: "CenterPoint installs bi-directional meter, REP provides buyback credit",
    website: "https://www.centerpointenergy.com/solar",
  },
  {
    id: "aep-texas",
    name: "AEP Texas",
    type: "deregulated_tdu",
    region: "Central & North Texas (Corpus Christi, Abilene, West Texas)",
    netMeteringPolicy: "full",
    buybackRate: 0.1,
    buybackPercentage: 100,
    retailRate: 0.1,
    monthlyFee: 0,
    connectionFee: 18,
    demandCharges: false,
    description: "TDU only - does not purchase excess energy directly",
    notes: "AEP Texas offers upfront solar rebates but no net metering billing. Choose REP with buyback plan.",
    website: "https://www.aeptexas.com/solar",
  },
  {
    id: "tnmp",
    name: "Texas-New Mexico Power (TNMP)",
    type: "deregulated_tdu",
    region: "West Texas, Gulf Coast, Suburbs",
    netMeteringPolicy: "full",
    buybackRate: 0.09,
    buybackPercentage: 100,
    retailRate: 0.09,
    monthlyFee: 0,
    connectionFee: 227,
    demandCharges: false,
    description: "TDU only - compensation through REP plans",
    notes: "TNMP charges ~$227 for DG meter installation. Buyback through REP selection.",
    website: "https://www.tnmp.com/solar",
  },
]

export default function TexasUtilitiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedPolicy, setSelectedPolicy] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")

  const regions = useMemo(() => {
    const regionSet = new Set(TEXAS_UTILITIES.map((utility) => utility.region))
    return Array.from(regionSet).sort()
  }, [])

  const filteredUtilities = useMemo(() => {
    return TEXAS_UTILITIES.filter((utility) => {
      const matchesSearch = utility.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || utility.type === selectedType
      const matchesPolicy = selectedPolicy === "all" || utility.netMeteringPolicy === selectedPolicy
      const matchesRegion = selectedRegion === "all" || utility.region === selectedRegion

      return matchesSearch && matchesType && matchesPolicy && matchesRegion
    })
  }, [searchTerm, selectedType, selectedPolicy, selectedRegion])

  const getPolicyBadge = (policy: string) => {
    switch (policy) {
      case "full":
        return <Badge className="bg-green-600 hover:bg-green-700">Full Net Metering</Badge>
      case "avoided_cost":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Avoided Cost</Badge>
      case "none":
        return <Badge className="bg-red-600 hover:bg-red-700">No Buyback</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "cooperative":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-400">
            Electric Cooperative
          </Badge>
        )
      case "deregulated_tdu":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-400">
            Deregulated TDU
          </Badge>
        )
      case "municipal":
        return (
          <Badge variant="outline" className="border-green-500 text-green-400">
            Municipal
          </Badge>
        )
      default:
        return <Badge variant="secondary">Other</Badge>
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Type",
      "Region",
      "Net Metering Policy",
      "Buyback Rate ($/kWh)",
      "Buyback Percentage",
      "Retail Rate ($/kWh)",
      "Monthly Solar Fee ($)",
      "Connection Fee ($)",
      "Demand Charges",
      "Description",
      "Notes",
    ]

    const csvData = filteredUtilities.map((utility) => [
      utility.name,
      utility.type,
      utility.region,
      utility.netMeteringPolicy,
      utility.buybackRate.toFixed(4),
      `${utility.buybackPercentage}%`,
      utility.retailRate.toFixed(4),
      utility.monthlyFee,
      utility.connectionFee,
      utility.demandCharges ? "Yes" : "No",
      utility.description,
      utility.notes || "",
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "texas-utilities-solar-policies.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-400">Texas Electric Utilities</h1>
              <p className="text-gray-400 mt-1">Solar buyback policies and net metering information</p>
            </div>
            <Button onClick={exportToCSV} className="bg-orange-500 hover:bg-orange-600">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Alert */}
        <Alert className="mb-8 border-blue-500/30 bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Important:</strong> Texas has no statewide net metering mandate. Each electric cooperative sets its
            own solar buyback policy. In deregulated areas (served by TDUs like Oncor, CenterPoint, AEP, TNMP), you must
            choose a Retail Electric Provider (REP) with a solar buyback plan to receive credit for excess generation.
          </AlertDescription>
        </Alert>

        {/* Filters */}
        <Card className="mb-8 bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-orange-400" />
              Search & Filter Utilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search" className="text-white mb-2 block">
                  Search by Name
                </Label>
                <Input
                  id="search"
                  placeholder="Enter utility name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Utility Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">
                      All Types
                    </SelectItem>
                    <SelectItem value="cooperative" className="text-white hover:bg-gray-700">
                      Electric Cooperatives
                    </SelectItem>
                    <SelectItem value="deregulated_tdu" className="text-white hover:bg-gray-700">
                      Deregulated TDUs
                    </SelectItem>
                    <SelectItem value="municipal" className="text-white hover:bg-gray-700">
                      Municipal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block">Net Metering Policy</Label>
                <Select value={selectedPolicy} onValueChange={setSelectedPolicy}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">
                      All Policies
                    </SelectItem>
                    <SelectItem value="full" className="text-white hover:bg-gray-700">
                      Full Net Metering
                    </SelectItem>
                    <SelectItem value="avoided_cost" className="text-white hover:bg-gray-700">
                      Avoided Cost
                    </SelectItem>
                    <SelectItem value="none" className="text-white hover:bg-gray-700">
                      No Buyback
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white mb-2 block">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white hover:bg-gray-700">
                      All Regions
                    </SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region} className="text-white hover:bg-gray-700">
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedType("all")
                    setSelectedPolicy("all")
                    setSelectedRegion("all")
                  }}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              Showing {filteredUtilities.length} of {TEXAS_UTILITIES.length} utilities
            </div>
          </CardContent>
        </Card>

        {/* Utility Type Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="all">All Utilities ({TEXAS_UTILITIES.length})</TabsTrigger>
            <TabsTrigger value="cooperatives">
              Cooperatives ({TEXAS_UTILITIES.filter((u) => u.type === "cooperative").length})
            </TabsTrigger>
            <TabsTrigger value="deregulated">
              Deregulated TDUs ({TEXAS_UTILITIES.filter((u) => u.type === "deregulated_tdu").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredUtilities.map((utility) => (
              <UtilityCard
                key={utility.id}
                utility={utility}
                getPolicyBadge={getPolicyBadge}
                getTypeBadge={getTypeBadge}
              />
            ))}
          </TabsContent>

          <TabsContent value="cooperatives" className="space-y-4">
            {filteredUtilities
              .filter((u) => u.type === "cooperative")
              .map((utility) => (
                <UtilityCard
                  key={utility.id}
                  utility={utility}
                  getPolicyBadge={getPolicyBadge}
                  getTypeBadge={getTypeBadge}
                />
              ))}
          </TabsContent>

          <TabsContent value="deregulated" className="space-y-4">
            <Alert className="mb-6 border-purple-500/30 bg-purple-900/20">
              <Info className="h-4 w-4 text-purple-400" />
              <AlertDescription className="text-purple-300">
                <strong>Deregulated Areas:</strong> In these areas, the TDU (Transmission/Distribution Utility) only
                handles the wires and metering. You must choose a Retail Electric Provider (REP) with a solar buyback
                plan to receive credit for excess generation. Many REPs offer 1:1 net metering plans.
              </AlertDescription>
            </Alert>
            {filteredUtilities
              .filter((u) => u.type === "deregulated_tdu")
              .map((utility) => (
                <UtilityCard
                  key={utility.id}
                  utility={utility}
                  getPolicyBadge={getPolicyBadge}
                  getTypeBadge={getTypeBadge}
                />
              ))}
          </TabsContent>
        </Tabs>

        {/* No Results */}
        {filteredUtilities.length === 0 && (
          <Card className="bg-gray-900/50 border-gray-700">
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No utilities found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search criteria or clearing the filters.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedType("all")
                  setSelectedPolicy("all")
                  setSelectedRegion("all")
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Card className="mt-12 bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">About This Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              This comprehensive database includes solar buyback policies for Texas electric cooperatives and
              deregulated utility areas. Data is compiled from 2023 Public Citizen reports and individual utility
              publications.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Electric Cooperatives</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Each co-op sets its own solar policy</li>
                  <li>• No statewide net metering mandate</li>
                  <li>• Policies range from full 1:1 credit to no buyback</li>
                  <li>• Many charge additional monthly fees for solar</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Deregulated Areas (TDUs)</h4>
                <ul className="space-y-1 text-sm">
                  <li>• TDU handles wires and metering only</li>
                  <li>• Must choose REP with solar buyback plan</li>
                  <li>• Many REPs offer 1:1 net metering plans</li>
                  <li>• Check Power to Choose for current plans</li>
                </ul>
              </div>
            </div>
            <Alert className="border-yellow-600 bg-yellow-900/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                <strong>Important:</strong> Rates and policies can change. Always verify current information with your
                utility or REP before making solar installation decisions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

// Utility Card Component
function UtilityCard({
  utility,
  getPolicyBadge,
  getTypeBadge,
}: {
  utility: TexasUtility
  getPolicyBadge: (policy: string) => JSX.Element
  getTypeBadge: (type: string) => JSX.Element
}) {
  return (
    <Card className="bg-gray-900/50 border-gray-700 hover:border-gray-600 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2">{utility.name}</CardTitle>
            <div className="flex flex-wrap gap-2 mb-3">
              {getTypeBadge(utility.type)}
              {getPolicyBadge(utility.netMeteringPolicy)}
              <Badge variant="outline" className="border-gray-500 text-gray-300">
                <MapPin className="h-3 w-3 mr-1" />
                {utility.region}
              </Badge>
            </div>
          </div>
          {utility.website && (
            <Button variant="ghost" size="sm" asChild className="text-orange-400 hover:text-orange-300">
              <a href={utility.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 mb-4">{utility.description}</p>

        {utility.notes && (
          <Alert className="mb-4 border-blue-500/30 bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300">{utility.notes}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-gray-400">Buyback Rate</span>
            </div>
            <p className="text-lg font-bold text-green-400">
              {utility.buybackRate > 0 ? `$${utility.buybackRate.toFixed(4)}` : "$0.00"}
            </p>
            <p className="text-xs text-gray-500">per kWh</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calculator className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-gray-400">% of Retail</span>
            </div>
            <p className="text-lg font-bold text-blue-400">{utility.buybackPercentage}%</p>
            <p className="text-xs text-gray-500">of retail rate</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-gray-400">Retail Rate</span>
            </div>
            <p className="text-lg font-bold text-yellow-400">${utility.retailRate.toFixed(4)}</p>
            <p className="text-xs text-gray-500">per kWh</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Building2 className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-gray-400">Solar Fee</span>
            </div>
            <p className="text-lg font-bold text-purple-400">
              {utility.monthlyFee > 0 ? `$${utility.monthlyFee}` : "$0"}
            </p>
            <p className="text-xs text-gray-500">per month</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Connection Fee:</span>
              <span className="ml-2 text-white">${utility.connectionFee}/month</span>
            </div>
            <div>
              <span className="text-gray-400">Demand Charges:</span>
              <span className="ml-2 text-white">{utility.demandCharges ? "Yes" : "No"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
