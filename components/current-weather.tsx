import { Card, CardContent } from "@/components/ui/card"
import { WeatherIcon } from "./weather-icon"
import type { WeatherData } from "@/lib/weather-api"
import { MapPin, Droplets, Wind, Eye, Gauge } from "lucide-react"

interface CurrentWeatherProps {
  weather: WeatherData
}

export function CurrentWeather({ weather }: CurrentWeatherProps) {
  const { current, location } = weather

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {location.name}, {location.country}
          </span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-4xl font-bold text-foreground mb-1">{current.temp}°C</div>
            <div className="text-sm text-muted-foreground capitalize">{current.description}</div>
            <div className="text-xs text-muted-foreground mt-1">Feels like {current.feels_like}°C</div>
          </div>
          <WeatherIcon condition={current.condition} size={80} className="drop-shadow-lg" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Humidity</div>
              <div className="font-medium">{current.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Wind</div>
              <div className="font-medium">{current.wind_speed} m/s</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Visibility</div>
              <div className="font-medium">{current.visibility} km</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-purple-500" />
            <div className="text-sm">
              <div className="text-muted-foreground">Pressure</div>
              <div className="font-medium">{current.pressure} hPa</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
