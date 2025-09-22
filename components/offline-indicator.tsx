"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Wifi, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)
  const [hasCache, setHasCache] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
        checkCacheStatus()
      } else {
        // Show "back online" message briefly
        setShowIndicator(true)
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    const checkCacheStatus = async () => {
      try {
        if ('caches' in window) {
          const cache = await caches.open('weather-api-v2')
          const cachedRequests = await cache.keys()
          setHasCache(cachedRequests.length > 0)
          
          if (cachedRequests.length > 0) {
            // Try to get timestamp from the first cached response
            const firstResponse = await cache.match(cachedRequests[0])
            if (firstResponse) {
              const timestamp = firstResponse.headers.get('sw-timestamp')
              if (timestamp) {
                const date = new Date(parseInt(timestamp))
                setLastUpdate(date.toLocaleTimeString())
              }
            }
          }
        }
      } catch (error) {
        console.log('Could not check cache status:', error)
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
        "fixed top-20 left-4 right-4 z-50 transition-all duration-300 max-w-md mx-auto",
        isOnline ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200",
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {isOnline ? (
              <CheckCircle className="w-4 h-4 text-green-600" />
            ) : (
              <WifiOff className="w-4 h-4 text-orange-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={cn("text-sm font-medium", isOnline ? "text-green-800" : "text-orange-800")}>
              {isOnline ? "Đã kết nối lại" : "Chế độ offline"}
            </div>
            
            {!isOnline && (
              <div className="text-xs text-orange-600 mt-1 space-y-1">
                {hasCache ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Hiển thị dữ liệu đã lưu</span>
                    </div>
                    {lastUpdate && (
                      <div className="text-orange-500">
                        Cập nhật lần cuối: {lastUpdate}
                      </div>
                    )}
                  </>
                ) : (
                  <div>Không có dữ liệu offline</div>
                )}
              </div>
            )}
            
            {isOnline && (
              <div className="text-xs text-green-600 mt-1">
                Dữ liệu sẽ được cập nhật tự động
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
