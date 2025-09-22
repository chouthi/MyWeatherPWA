// hooks/use-weather.ts
"use client"
import { useState, useCallback } from "react"
import { weatherAPI, type WeatherData, type GeolocationCoords } from "@/lib/weather-api"

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: any) => {
    const message = err instanceof Error ? err.message : "An error occurred"
    setError(message)
    console.error("Weather error:", err)
  }

  const getWeatherByLocation = useCallback(async (coords: GeolocationCoords) => {
    setLoading(true); setError(null)
    try {
      const data = await weatherAPI.getCurrentWeather(coords.lat, coords.lon)
      setWeather(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getWeatherByCity = useCallback(async (city: string) => {
    setLoading(true); setError(null)
    try {
      const data = await weatherAPI.getWeatherByCity(city)
      setWeather(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // HÀM MỚI: chỉ gọi khi người dùng bấm nút
  const askLocationAndFetch = useCallback(() => {
    setError(null)
    if (!("geolocation" in navigator)) {
      setError("Thiết bị không hỗ trợ định vị")
      return
    }

    // NOTE: Gọi thẳng getCurrentPosition trong stack của onClick
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await getWeatherByLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          })
        } finally {
          setLoading(false)
        }
      },
      (err) => {
        setLoading(false)
        // iOS có thể trả PERMISSION_DENIED nếu gọi sai ngữ cảnh hoặc bị nhớ deny
        setError(err?.message || "Không thể lấy vị trí")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [getWeatherByLocation])

  const refreshWeather = useCallback(async () => {
    if (weather) {
      await getWeatherByLocation({ lat: weather.location.lat, lon: weather.location.lon })
    }
  }, [weather, getWeatherByLocation])

  // ❌ BỎ hẳn auto load lúc mount để tránh xin quyền khi chưa bấm nút
  // useEffect(() => { ... }, [])

  return {
    weather,
    loading,
    error,
    refreshWeather,
    getWeatherByLocation,
    getWeatherByCity,
    askLocationAndFetch, // <- expose ra UI
  }
}
