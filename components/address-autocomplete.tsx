"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"

interface AddressSuggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, placeId: string) => void
  placeholder?: string
  className?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter address...",
  className,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Debounce the search
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/places?input=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (data.success && data.predictions) {
          setSuggestions(data.predictions)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (error) {
        console.error("Error fetching address suggestions:", error)
        setSuggestions([])
        setShowSuggestions(false)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.description)
    setShowSuggestions(false)
    onAddressSelect(suggestion.description, suggestion.place_id)
  }

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-0">
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.place_id}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 rounded-none border-b last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{suggestion.structured_formatting.main_text}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
