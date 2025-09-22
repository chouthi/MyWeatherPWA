"use client"

import { useEffect } from "react"
import { registerSW } from "@/lib/cache-utils"

export function ServiceWorkerProvider() {
  useEffect(() => {
    registerSW()
  }, [])

  return null
}