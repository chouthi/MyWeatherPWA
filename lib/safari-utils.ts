// lib/safari-utils.ts
// Utility functions để xử lý đặc biệt cho Safari trên iOS

export const detectSafari = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent
  return /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
}

export const detectMobileSafari = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const userAgent = window.navigator.userAgent
  return /iPhone|iPad|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
}

export const detectStandalonePWA = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return (window.navigator as any).standalone === true || 
         window.matchMedia('(display-mode: standalone)').matches
}

export const getSafariLocationHelp = (): string => {
  const isMobileSafari = detectMobileSafari()
  const isStandalone = detectStandalonePWA()
  
  if (isMobileSafari && isStandalone) {
    return `
Trên PWA Safari iOS:
1. Mở Settings → Privacy & Security → Location Services
2. Bật Location Services
3. Tìm Safari và chọn "While Using App"
4. Nếu không thấy hiệu quả, xóa PWA và cài lại từ Safari
5. Refresh và thử lại
    `.trim()
  }
  
  if (isMobileSafari) {
    return `
Trên Safari iOS:
1. Mở Settings → Privacy & Security → Location Services  
2. Bật Location Services
3. Tìm Safari Websites và chọn "While Using App"
4. Refresh trang và thử lại
    `.trim()
  }
  
  return "Vui lòng kiểm tra cài đặt location trong browser và thử lại."
}

export const requestLocationWithSafariSupport = async (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation không được hỗ trợ'))
      return
    }

    const isMobileSafari = detectMobileSafari()
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: isMobileSafari ? 20000 : 10000, // Safari cần thời gian lâu hơn
      maximumAge: 300000
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        console.error('Geolocation error:', error)
        
        let enhancedError = error
        if (isMobileSafari && error.code === error.PERMISSION_DENIED) {
          ;(enhancedError as any).safariHelp = getSafariLocationHelp()
        }
        
        reject(enhancedError)
      },
      options
    )
  })
}