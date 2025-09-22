import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function WeatherSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current Weather Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-32 h-4" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="w-24 h-12 mb-2" />
              <Skeleton className="w-40 h-4 mb-1" />
              <Skeleton className="w-28 h-3" />
            </div>
            <Skeleton className="w-20 h-20 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <div className="space-y-1">
                  <Skeleton className="w-16 h-3" />
                  <Skeleton className="w-12 h-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Forecast Skeleton */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-32 h-5" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[80px] p-3">
                <Skeleton className="w-8 h-3" />
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-6 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
