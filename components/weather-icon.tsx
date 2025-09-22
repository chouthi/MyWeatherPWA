import { Sun, Cloud, CloudRain, CloudSnow, Zap, CloudDrizzle, EyeOff } from "lucide-react"

interface WeatherIconProps {
  condition: string
  icon?: string
  size?: number
  className?: string
}

export function WeatherIcon({ condition, icon, size = 24, className = "" }: WeatherIconProps) {
  const getIconComponent = () => {
    // Map OpenWeatherMap conditions to icons
    switch (condition.toLowerCase()) {
      case "clear":
        return <Sun size={size} className={`text-yellow-500 ${className}`} />
      case "clouds":
        return <Cloud size={size} className={`text-gray-500 ${className}`} />
      case "rain":
        return <CloudRain size={size} className={`text-blue-500 ${className}`} />
      case "drizzle":
        return <CloudDrizzle size={size} className={`text-blue-400 ${className}`} />
      case "snow":
        return <CloudSnow size={size} className={`text-blue-200 ${className}`} />
      case "thunderstorm":
        return <Zap size={size} className={`text-purple-500 ${className}`} />
      case "mist":
      case "fog":
      case "haze":
        return <EyeOff size={size} className={`text-gray-400 ${className}`} />
      default:
        return <Sun size={size} className={`text-yellow-500 ${className}`} />
    }
  }

  return getIconComponent()
}
