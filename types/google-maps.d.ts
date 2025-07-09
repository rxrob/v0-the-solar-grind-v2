import type React from "react"
// This file is intentionally left blank in this project.
// We will add the necessary types for the Google Maps Web Components.

// Declare the google variable to fix the lint error
declare const google: any

// Augment the google.maps namespace to include the new Place object structure
// This is a simplified version for the properties we use.
declare namespace google.maps.places {
  interface Place {
    id: string
    formattedAddress: string
    location: google.maps.LatLng
    addressComponents: google.maps.GeocoderAddressComponent[]
  }
}

// Define the custom element for JSX
declare namespace JSX {
  interface IntrinsicElements {
    "gmpx-place-autocomplete": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      onPlaceChange?: (event: CustomEvent<{ value: google.maps.places.Place | null }>) => void
    }
  }
}
