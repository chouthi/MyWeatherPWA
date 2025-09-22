"use client"

import { useState, useEffect, useCallback } from "react"
import { weatherAPI, type WeatherData, type GeolocationCoords } from "@/lib/weather-api"

export interface UseWeatherReturn {
  weather: WeatherData | null
  loading: boolean
  error: string | null
  refreshWeather: () => Promise<void>
  getWeatherByLocation: (coords: GeolocationCoords) => Promise<void>
  getWeatherByCity: (city: string) => Promise<void>
  getCurrentLocationWeather: () => Promise<void>
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: any) => {
    const message = err instanceof Error ? err.message : "An error occurred"
    setError(message)
    console.error("Weather error:", err)
  }

  const getWeatherByLocation = useCallback(async (coords: GeolocationCoords) => {
    setLoading(true)
    setError(null)

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
    setLoading(true)
    setError(null)

    try {
      const data = await weatherAPI.getWeatherByCity(city)
      setWeather(data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const getCurrentLocationWeather = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const coords = await weatherAPI.getCurrentLocation()
      await getWeatherByLocation(coords)
    } catch (err) {
      handleError(err)
      setLoading(false)
    }
  }, [getWeatherByLocation])

  const refreshWeather = useCallback(async () => {
    if (weather) {
      await getWeatherByLocation({
        lat: weather.location.lat,
        lon: weather.location.lon,
      })
    }
  }, [weather, getWeatherByLocation])

  // Load default weather on mount (try geolocation, fallback to a default city)
  useEffect(() => {
    const loadInitialWeather = async () => {
      try {
        await getCurrentLocationWeather()
      } catch {
        // Fallback to a default city if geolocation fails
        await getWeatherByCity("London")
      }
    }

    loadInitialWeather()
  }, [getCurrentLocationWeather, getWeatherByCity])

  return {
    weather,
    loading,
    error,
    refreshWeather,
    getWeatherByLocation,
    getWeatherByCity,
    getCurrentLocationWeather,
  }
}
