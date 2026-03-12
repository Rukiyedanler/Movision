"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Filter, Check, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getMovieGenres, getTvGenres } from "@/lib/tmdb"

interface Genre {
  id: number
  name: string
}

export function FilterPopover() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mediaType, setMediaType] = useState("all")
  const [yearRange, setYearRange] = useState([1970, 2025])
  const [duration, setDuration] = useState([0, 240])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [ratingFilter, setRatingFilter] = useState(0) // 0 means no filter

  // Türleri yükle
  useEffect(() => {
    async function loadGenres() {
      setIsLoading(true)
      try {
        const movieGenresData = await getMovieGenres()
        const tvGenresData = await getTvGenres()

        // Tüm türleri birleştir ve tekrar edenleri kaldır
        const allGenres = [...movieGenresData.genres, ...tvGenresData.genres]
        const uniqueGenres = Array.from(new Map(allGenres.map((genre) => [genre.id, genre])).values())

        setGenres(uniqueGenres)
      } catch (error) {
        console.error("Türler yüklenirken hata oluştu:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadGenres()
  }, [])

  const handleGenreChange = (genreId: number) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]))
  }

  const removeGenre = (genreId: number) => {
    setSelectedGenres((prev) => prev.filter((id) => id !== genreId))
  }

  const applyFilters = () => {
    // Filtreleri URL parametrelerine dönüştürüp yönlendirme yap
    const params = new URLSearchParams()

    if (mediaType !== "all") {
      params.append("type", mediaType)
    }

    params.append("year_from", yearRange[0].toString())
    params.append("year_to", yearRange[1].toString())

    params.append("duration_from", duration[0].toString())
    params.append("duration_to", duration[1].toString())

    if (selectedGenres.length > 0) {
      params.append("genres", selectedGenres.join(","))
    }

    if (ratingFilter > 0) {
      params.append("rating_min", ratingFilter.toString())
    }

    // Add a timestamp parameter to force a refresh
    params.append("t", Date.now().toString())

    router.push(`/search?${params.toString()}`)
    setOpen(false)
  }

  const resetFilters = () => {
    setMediaType("all")
    setYearRange([1970, 2025])
    setDuration([0, 240])
    setSelectedGenres([])
    setRatingFilter(0)
  }

  const getGenreName = (genreId: number) => {
    return genres.find((genre) => genre.id === genreId)?.name || ""
  }

  const handleRatingChange = (rating: number) => {
    setRatingFilter(rating === ratingFilter ? 0 : rating)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="ml-2 flex-shrink-0">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-[80vh] flex flex-col" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Filtreler</h3>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
            Sıfırla
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-auto">
          <div className="p-4 space-y-6">
            <div>
              <Label className="mb-2 block">İçerik Türü</Label>
              <Tabs defaultValue={mediaType} onValueChange={setMediaType} className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    Tümü
                  </TabsTrigger>
                  <TabsTrigger value="movie" className="flex-1">
                    Film
                  </TabsTrigger>
                  <TabsTrigger value="tv" className="flex-1">
                    Dizi
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {selectedGenres.length > 0 && (
              <div>
                <Label className="mb-2 block">Seçilen Türler</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedGenres.map((genreId) => (
                    <Badge key={genreId} variant="secondary" className="flex items-center gap-1">
                      {getGenreName(genreId)}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeGenre(genreId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between mb-2">
                <Label>Yıl Aralığı</Label>
                <span className="text-xs text-muted-foreground">
                  {yearRange[0]} - {yearRange[1]}
                </span>
              </div>
              <div className="pt-4 pb-2 px-1">
                <Slider
                  defaultValue={yearRange}
                  min={1900}
                  max={2025}
                  step={1}
                  value={yearRange}
                  onValueChange={setYearRange}
                  className="my-4"
                  thumbClassName="h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  trackClassName="h-2 rounded-full bg-primary/20"
                  rangeClassName="h-2 rounded-full bg-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Süre (dakika)</Label>
                <span className="text-xs text-muted-foreground">
                  {duration[0]} - {duration[1] === 240 ? "240+" : duration[1]}
                </span>
              </div>
              <div className="pt-4 pb-2 px-1">
                <Slider
                  defaultValue={duration}
                  min={0}
                  max={240}
                  step={5}
                  value={duration}
                  onValueChange={setDuration}
                  className="my-4"
                  thumbClassName="h-5 w-5 rounded-full border-2 border-primary bg-background shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  trackClassName="h-2 rounded-full bg-primary/20"
                  rangeClassName="h-2 rounded-full bg-primary"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Minimum Puan</Label>
              <div className="flex items-center justify-center mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="focus:outline-none"
                      onClick={() => handleRatingChange(star * 2)}
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star * 2 <= ratingFilter ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        } hover:fill-yellow-400 hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {ratingFilter > 0 && (
                <div className="text-center mt-2">
                  <Button variant="ghost" size="sm" onClick={() => setRatingFilter(0)}>
                    Filtreyi Temizle
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label className="mb-2 block">Türler</Label>
              {isLoading ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-40 rounded-md border p-2">
                  <div className="space-y-2">
                    {genres.map((genre) => (
                      <div key={genre.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre.id}`}
                          checked={selectedGenres.includes(genre.id)}
                          onCheckedChange={() => handleGenreChange(genre.id)}
                        />
                        <label
                          htmlFor={`genre-${genre.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {genre.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-end p-4 border-t sticky bottom-0 bg-background">
          <Button size="sm" onClick={applyFilters}>
            <Check className="mr-2 h-4 w-4" />
            Uygula
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
