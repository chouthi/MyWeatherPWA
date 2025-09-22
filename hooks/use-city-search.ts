"use client"

import { useState, useCallback, useEffect } from "react"
import { weatherAPI } from "@/lib/weather-api"

export interface CityResult {
  name: string
  country: string
  lat: number
  lon: number
}

export interface UseCitySearchReturn {
  query: string
  setQuery: (query: string) => void
  results: CityResult[]
  loading: boolean
  error: string | null
  clearResults: () => void
}

export function useCitySearch(): UseCitySearchReturn {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CityResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  const searchCities = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const cities = await weatherAPI.searchCities(searchQuery)
      setResults(cities)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed"
      setError(message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, searchCities])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults,
  }
}
