import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WeatherIcon } from "./weather-icon"
import type { HourlyForecast as HourlyForecastType } from "@/lib/weather-api"
import { Clock } from "lucide-react"

interface HourlyForecastProps {
  forecast: HourlyForecastType[]
}

export function HourlyForecast({ forecast }: HourlyForecastProps) {
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          24-Hour Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {forecast.map((hour, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="text-xs text-muted-foreground font-medium">
                {index === 0 ? "Now" : formatTime(hour.time)}
              </div>

              <WeatherIcon condition={hour.condition} size={32} className="flex-shrink-0" />

              <div className="text-sm font-semibold text-foreground">{hour.temp}°</div>

              {hour.precipitation > 0 && <div className="text-xs text-blue-500">{Math.round(hour.precipitation)}%</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
