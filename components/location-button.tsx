"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LocationButtonProps {
  onLocationFound: (coords: { lat: number; lon: number }) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function LocationButton({
  onLocationFound,
  className,
  variant = "outline",
  size = "default",
}: LocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      onLocationFound({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
    } catch (err) {
      let message = "Failed to get location"

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            message = "Location access denied"
            break
          case err.POSITION_UNAVAILABLE:
            message = "Location unavailable"
            break
          case err.TIMEOUT:
            message = "Location request timed out"
            break
        }
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleGetLocation}
      disabled={loading}
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      title={error || "Get current location weather"}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
      {size !== "sm" && (loading ? "Getting location..." : "Current Location")}
    </Button>
  )
}
