"use client"

import { WeatherHeader } from "@/components/weather-header"
import { CurrentWeather } from "@/components/current-weather"
import { HourlyForecast } from "@/components/hourly-forecast"
import { WeatherSkeleton } from "@/components/weather-skeleton"
import { ErrorDisplay } from "@/components/error-display"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInstaller } from "@/components/pwa-installer"
import { useWeather } from "@/hooks/use-weather"
import type { CityResult } from "@/hooks/use-city-search"

export default function HomePage() {
  const { weather, loading, error, refreshWeather, getWeatherByLocation, getWeatherByCity } = useWeather()

  const handleCitySelect = async (city: CityResult) => {
    await getWeatherByLocation({ lat: city.lat, lon: city.lon })
  }

  const handleLocationSelect = async (coords: { lat: number; lon: number }) => {
    await getWeatherByLocation(coords)
  }

  return (
    <div className="min-h-screen bg-background">
      <WeatherHeader
        onCitySelect={handleCitySelect}
        onLocationSelect={handleLocationSelect}
        onRefresh={refreshWeather}
        loading={loading}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <OfflineIndicator />

        {loading && !weather && <WeatherSkeleton />}

        {error && !weather && <ErrorDisplay error={error} onRetry={refreshWeather} />}

        {weather && (
          <>
            <CurrentWeather weather={weather} />
            <HourlyForecast forecast={weather.forecast} />
          </>
        )}

        {error && weather && (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Unable to refresh data. Showing cached weather information.</p>
          </div>
        )}
      </main>

      <PWAInstaller />
    </div>
  )
}
