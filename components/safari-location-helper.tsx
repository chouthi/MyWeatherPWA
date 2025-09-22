"use client"

import { useEffect, useState } from "react"
import { detectMobileSafari, detectStandalonePWA } from "@/lib/safari-utils"
import { AlertTriangle, Smartphone } from "lucide-react"

export function SafariLocationHelper() {
  const [showHelper, setShowHelper] = useState(false)
  const [isMobileSafari, setIsMobileSafari] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const mobileSafari = detectMobileSafari()
    const standalone = detectStandalonePWA()
    
    setIsMobileSafari(mobileSafari)
    setIsStandalone(standalone)
    setShowHelper(mobileSafari)
  }, [])

  if (!showHelper) return null

  return (
    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {isStandalone ? <Smartphone className="w-5 h-5 text-amber-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-900 mb-2">
            {isStandalone ? "PWA trên Safari iOS" : "Safari trên iOS"}
          </h4>
          <div className="text-sm text-amber-800 space-y-2">
            <p>Để sử dụng định vị, cần:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Mở Settings → Privacy & Security → Location Services</li>
              <li>Bật Location Services</li>
              {isStandalone ? (
                <li>Tìm Safari và chọn "While Using App"</li>
              ) : (
                <li>Tìm Safari Websites và chọn "While Using App"</li>
              )}
              <li>Quay lại ứng dụng và bấm nút "Dùng vị trí của tôi"</li>
            </ol>
            {isStandalone && (
              <p className="text-xs mt-2 italic">
                * Nếu vẫn không được, thử xóa PWA và cài lại từ Safari
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}