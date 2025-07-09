"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Displays the property details after an address has been selected.
 */
export default function PropertyDetails({
  address,
  zipCode,
}: {
  address?: string
  zipCode?: string
}) {
  if (!address) {
    return null
  }

  return (
    <div className="mt-6">
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Selected Property</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Address:</strong> {address}
          </p>
          {zipCode && (
            <p>
              <strong>ZIP Code:</strong> {zipCode}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
