"use client"

import { CitySearch } from "./city-search"
import { LocationButton } from "./location-button"
import { Button } from "@/components/ui/button"
import { RefreshCw, Sun, Moon } from "lucide-react"
import type { CityResult } from "@/hooks/use-city-search"
import { useState, useEffect } from "react"

interface WeatherHeaderProps {
  onCitySelect: (city: CityResult) => void
  onLocationSelect: (coords: { lat: number; lon: number }) => void
  onRefresh: () => void
  loading?: boolean
}

export function WeatherHeader({ onCitySelect, onLocationSelect, onRefresh, loading = false }: WeatherHeaderProps) {
  const [isDark, setIsDark] = useState(false)

  // Check for dark mode preference
  useEffect(() => {
    const checkDarkMode = () => {
      const isDarkMode =
        document.documentElement.classList.contains("dark") || window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(isDarkMode)
    }

    checkDarkMode()

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", checkDarkMode)

    return () => mediaQuery.removeEventListener("change", checkDarkMode)
  }, [])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setIsDark(!isDark)
  }

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Weather PWA</h1>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading} className="p-2">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <CitySearch onCitySelect={onCitySelect} className="flex-1" />

          <LocationButton onLocationFound={onLocationSelect} size="default" className="sm:w-auto" />
        </div>
      </div>
    </header>
  )
}
