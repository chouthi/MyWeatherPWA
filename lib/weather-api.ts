export interface WeatherData {
  location: {
    name: string
    country: string
    lat: number
    lon: number
  }
  current: {
    temp: number
    feels_like: number
    humidity: number
    pressure: number
    visibility: number
    uv_index: number
    condition: string
    description: string
    icon: string
    wind_speed: number
    wind_direction: number
  }
  forecast: HourlyForecast[]
}

export interface HourlyForecast {
  time: string
  temp: number
  condition: string
  icon: string
  precipitation: number
  wind_speed: number
}

export interface GeolocationCoords {
  lat: number
  lon: number
}

// Use hardcoded API key due to env override issue
const API_KEY = "25716f48bf804b733a791798731f8d80" 
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export class WeatherAPI {
  private static instance: WeatherAPI
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

  static getInstance(): WeatherAPI {
    if (!WeatherAPI.instance) {
      WeatherAPI.instance = new WeatherAPI()
    }
    return WeatherAPI.instance
  }

  private getCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async fetchWithCache<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(cacheKey)
    if (cached && this.isValidCache(cached.timestamp)) {
      console.log('Using valid cache data')
      return cached.data
    }

    try {
      console.log('Attempting network fetch...')
      const data = await fetchFn()
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      // Store in localStorage for offline access
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `weather_${cacheKey}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          }),
        )
      }

      return data
    } catch (error) {
      console.log('Network fetch failed:', error instanceof Error ? error.message : String(error))
      
      // Try to get from localStorage if network fails
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`weather_${cacheKey}`)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            console.log('Using localStorage cache data')
            return parsed.data
          } catch (parseError) {
            console.warn('Failed to parse localStorage data:', parseError)
          }
        }
      }
      
      // Try memory cache even if expired
      if (cached) {
        console.log('Using expired cache data as fallback')
        return cached.data
      }
      
      // Last resort: generate fallback data if this is a weather request
      if (cacheKey.includes('current')) {
        console.log('Using demo fallback data')
        return this.generateFallbackData() as T
      }
      
      throw error
    }
  }

  private generateFallbackData(): WeatherData {
    return {
      location: {
        name: "Demo Location",
        country: "VN", 
        lat: 21.0285,
        lon: 105.8542
      },
      current: {
        temp: 28,
        feels_like: 30,
        humidity: 70,
        pressure: 1013,
        visibility: 10,
        uv_index: 5,
        condition: "Partly Cloudy",
        description: "Có mây một phần",
        icon: "02d",
        wind_speed: 8,
        wind_direction: 180
      },
      forecast: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 3600000).toISOString(),
        temp: Math.round((25 + Math.random() * 6) * 10) / 10,
        condition: "Partly Cloudy",
        icon: "02d",
        precipitation: Math.round(Math.random() * 20 * 10) / 10,
        wind_speed: Math.round((5 + Math.random() * 10) * 10) / 10
      }))
    }
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
    const cacheKey = this.getCacheKey("current", { lat, lon })

    return this.fetchWithCache(cacheKey, async () => {
      const weatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      const forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      
      console.log('Fetching weather from API...')
      
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(weatherUrl),
        fetch(forecastUrl),
      ])

      if (!currentResponse.ok || !forecastResponse.ok) {
        const weatherError = !currentResponse.ok ? await currentResponse.text() : null
        const forecastError = !forecastResponse.ok ? await forecastResponse.text() : null
        
        console.error('API Response errors:', {
          weather: { status: currentResponse.status, error: weatherError },
          forecast: { status: forecastResponse.status, error: forecastError }
        })
        
        // Check specific error codes
        if (currentResponse.status === 401 || forecastResponse.status === 401) {
          throw new Error("Invalid API key")
        } else if (currentResponse.status === 429 || forecastResponse.status === 429) {
          throw new Error("API rate limit exceeded")
        } else if (currentResponse.status === 503 || forecastResponse.status === 503) {
          throw new Error("API service temporarily unavailable")
        } else {
          throw new Error(`API error: ${currentResponse.status}/${forecastResponse.status}`)
        }
      }

      const currentData = await currentResponse.json()
      const forecastData = await forecastResponse.json()

      console.log('Weather data fetched successfully:', currentData.name)
      return this.transformWeatherData(currentData, forecastData)
    })
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    const cacheKey = this.getCacheKey("city", { city })

    return this.fetchWithCache(cacheKey, async () => {
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`,
      )

      if (!geoResponse.ok) {
        throw new Error("Failed to find city")
      }

      const geoData = await geoResponse.json()
      if (geoData.length === 0) {
        throw new Error("City not found")
      }

      const { lat, lon } = geoData[0]
      return this.getCurrentWeather(lat, lon)
    })
  }

  async searchCities(query: string): Promise<Array<{ name: string; country: string; lat: number; lon: number }>> {
    if (query.length < 2) return []

    const cacheKey = this.getCacheKey("search", { query })

    return this.fetchWithCache(cacheKey, async () => {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`,
      )

      if (!response.ok) {
        throw new Error("Failed to search cities")
      }

      const data = await response.json()
      return data.map((item: any) => ({
        name: item.name,
        country: item.country,
        lat: item.lat,
        lon: item.lon,
      }))
    })
  }

  private transformWeatherData(currentData: any, forecastData: any): WeatherData {
    const hourlyForecast: HourlyForecast[] = forecastData.list.slice(0, 24).map((item: any) => ({
      time: new Date(item.dt * 1000).toISOString(),
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      icon: item.weather[0].icon,
      precipitation: item.pop * 100,
      wind_speed: item.wind.speed,
    }))

    return {
      location: {
        name: currentData.name,
        country: currentData.sys.country,
        lat: currentData.coord.lat,
        lon: currentData.coord.lon,
      },
      current: {
        temp: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility / 1000, // Convert to km
        uv_index: 0, // Not available in free tier
        condition: currentData.weather[0].main,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
        wind_speed: currentData.wind.speed,
        wind_direction: currentData.wind.deg,
      },
      forecast: hourlyForecast,
    }
  }

  // Get user's current location
  async getCurrentLocation(): Promise<GeolocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }
}

export const weatherAPI = WeatherAPI.getInstance()
