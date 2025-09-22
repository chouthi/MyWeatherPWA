// app/page.tsx (HomePage)
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
  const {
    weather, loading, error,
    refreshWeather, getWeatherByLocation, getWeatherByCity,
    askLocationAndFetch,
  } = useWeather()

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

        {/* Nút xin quyền vị trí theo “user gesture” */}
        <div className="flex justify-center">
          <button
            onClick={askLocationAndFetch}
            className="px-4 py-2 rounded-lg border bg-primary text-primary-foreground hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Đang lấy vị trí..." : "Dùng vị trí của tôi"}
          </button>
        </div>

        {loading && !weather && <WeatherSkeleton />}

        {error && !weather && <ErrorDisplay error={error} onRetry={askLocationAndFetch} />}

        {weather && (
          <>
            <CurrentWeather weather={weather} />
            <HourlyForecast forecast={weather.forecast} />
          </>
        )}

        {error && weather && (
          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Không thể cập nhật. Đang hiển thị dữ liệu cache.
            </p>
          </div>
        )}
      </main>

      <PWAInstaller />
    </div>
  )
}
