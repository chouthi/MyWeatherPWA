"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Hide indicator after a brief delay when coming back online
        setTimeout(() => setShowIndicator(false), 2000)
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [])

  if (!showIndicator) return null

  return (
    <Card
      className={cn(
        "fixed top-20 left-4 right-4 z-50 transition-all duration-300",
        isOnline ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
          <span className={cn("text-sm font-medium", isOnline ? "text-green-800" : "text-red-800")}>
            {isOnline ? "Back online" : "You are offline - showing cached data"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
