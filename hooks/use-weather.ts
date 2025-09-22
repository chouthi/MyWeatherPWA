// hooks/use-weather.ts
"use client"
import { useState, useCallback } from "react"
import { weatherAPI, type WeatherData, type GeolocationCoords } from "@/lib/weather-api"
import { requestLocationWithSafariSupport, getSafariLocationHelp, detectMobileSafari } from "@/lib/safari-utils"

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

  // HÀM MỚI: chỉ gọi khi người dùng bấm nút - tối ưu cho Safari iOS
  const askLocationAndFetch = useCallback(async () => {
    setError(null)
    
    if (!("geolocation" in navigator)) {
      setError("Thiết bị không hỗ trợ định vị")
      return
    }

    setLoading(true)
    
    try {
      const position = await requestLocationWithSafariSupport()
      
      await getWeatherByLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      })
    } catch (err: any) {
      let errorMessage = "Không thể lấy vị trí"
      
      if (err.code) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = detectMobileSafari() 
              ? `Quyền truy cập vị trí đã bị từ chối.\n\n${getSafariLocationHelp()}`
              : "Quyền truy cập vị trí đã bị từ chối. Vui lòng bật location trong browser settings."
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Không thể xác định vị trí. Vui lòng kiểm tra GPS và thử lại."
            break
          case err.TIMEOUT:
            errorMessage = "Timeout khi lấy vị trí. Vui lòng thử lại."
            break
          default:
            errorMessage = err.message || "Lỗi không xác định khi lấy vị trí"
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
