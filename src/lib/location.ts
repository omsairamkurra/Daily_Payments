export interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

export function formatLocation(location: LocationData | null): string {
  if (!location) return ''
  return `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`
}

export function parseLocation(locationString: string | null): LocationData | null {
  if (!locationString) return null
  const [lat, lng] = locationString.split(',').map(Number)
  if (isNaN(lat) || isNaN(lng)) return null
  return { latitude: lat, longitude: lng, accuracy: 0 }
}

export function getLocationString(location: string | null): string {
  if (!location) return 'N/A'
  return location
}
