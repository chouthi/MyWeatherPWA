"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCitySearch, type CityResult } from "@/hooks/use-city-search"
import { Search, MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface CitySearchProps {
  onCitySelect: (city: CityResult) => void
  className?: string
}

export function CitySearch({ onCitySelect, className }: CitySearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { query, setQuery, results, loading, clearResults } = useCitySearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setIsOpen(value.length > 0)
  }

  const handleCitySelect = (city: CityResult) => {
    onCitySelect(city)
    setQuery("")
    setIsOpen(false)
    clearResults()
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setQuery("")
    setIsOpen(false)
    clearResults()
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="pl-10 pr-10 bg-input border-border"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border-border shadow-lg">
          <CardContent className="p-0">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            )}

            {!loading && results.length === 0 && query.length > 1 && (
              <div className="p-4 text-center text-sm text-muted-foreground">No cities found for "{query}"</div>
            )}

            {!loading && results.length > 0 && (
              <div className="max-h-60 overflow-y-auto">
                {results.map((city, index) => (
                  <button
                    key={`${city.lat}-${city.lon}-${index}`}
                    onClick={() => handleCitySelect(city)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left border-b border-border last:border-b-0"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{city.name}</div>
                      <div className="text-sm text-muted-foreground">{city.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
