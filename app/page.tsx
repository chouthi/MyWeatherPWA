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

        {/* Nút xin quyền vị trí theo "user gesture" */}
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

        {error && !weather && (
          <div className="space-y-4">
            <ErrorDisplay error={error} onRetry={askLocationAndFetch} />
            
            {/* Hướng dẫn đặc biệt cho Safari iOS */}
            {error.includes("từ chối") && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn bật định vị trên Safari iOS:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Mở Settings (Cài đặt) trên iPhone</li>
                  <li>Chọn Privacy & Security → Location Services</li>
                  <li>Bật Location Services</li>
                  <li>Tìm Safari và chọn "While Using App"</li>
                  <li>Quay lại ứng dụng và thử lại</li>
                </ol>
                <p className="text-xs text-blue-600 mt-2">
                  * Nếu vẫn không được, hãy xóa ứng dụng khỏi màn hình chính và cài lại từ Safari
                </p>
              </div>
            )}
          </div>
        )}

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