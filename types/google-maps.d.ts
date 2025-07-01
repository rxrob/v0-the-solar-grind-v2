declare global {
  interface Window {
    google: typeof google
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element | null, opts?: MapOptions)
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral
      zoom?: number
      mapTypeId?: MapTypeId
    }

    interface LatLng {
      lat(): number
      lng(): number
    }

    interface LatLngLiteral {
      lat: number
      lng: number
    }

    enum MapTypeId {
      HYBRID = "hybrid",
      ROADMAP = "roadmap",
      SATELLITE = "satellite",
      TERRAIN = "terrain",
    }

    namespace places {
      class AutocompleteService {
        getPlacePredictions(
          request: AutocompletionRequest,
          callback: (predictions: AutocompletePrediction[] | null, status: PlacesServiceStatus) => void,
        ): void
      }

      class PlacesService {
        constructor(attrContainer: HTMLDivElement | Map)
        getDetails(
          request: PlaceDetailsRequest,
          callback: (place: PlaceResult | null, status: PlacesServiceStatus) => void,
        ): void
      }

      interface AutocompletionRequest {
        input: string
        types?: string[]
        componentRestrictions?: ComponentRestrictions
      }

      interface ComponentRestrictions {
        country?: string | string[]
      }

      interface AutocompletePrediction {
        place_id: string
        description: string
        structured_formatting: {
          main_text: string
          secondary_text: string
        }
      }

      interface PlaceDetailsRequest {
        placeId: string
        fields?: string[]
      }

      interface PlaceResult {
        place_id?: string
        formatted_address?: string
        geometry?: PlaceGeometry
      }

      interface PlaceGeometry {
        location?: LatLng
      }

      enum PlacesServiceStatus {
        OK = "OK",
        UNKNOWN_ERROR = "UNKNOWN_ERROR",
        OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
        REQUEST_DENIED = "REQUEST_DENIED",
        INVALID_REQUEST = "INVALID_REQUEST",
        ZERO_RESULTS = "ZERO_RESULTS",
      }
    }
  }
}

export {}
