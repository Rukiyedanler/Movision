"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getMovieDetails, formatMovieData } from "@/lib/tmdb"

export default function MovieTrailerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTrailer() {
      try {
        setIsLoading(true)
        const movieData = await getMovieDetails(Number(params.id))
        const movie = formatMovieData(movieData)

        if (movie.trailerUrl) {
          setTrailerUrl(`https://www.youtube.com/embed/${movie.trailerUrl}?autoplay=1`)
        } else {
          setError("Bu film için fragman bulunamadı.")
        }
      } catch (err) {
        setError("Fragman yüklenirken bir hata oluştu.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTrailer()
  }, [params.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <Button className="absolute top-4 right-4 z-10" variant="outline" size="icon" onClick={() => router.back()}>
        <X className="h-5 w-5" />
      </Button>

      <div className="relative w-full max-w-5xl aspect-video">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-lg mb-4">{error}</p>
              <Button onClick={() => router.back()}>Geri Dön</Button>
            </div>
          </div>
        ) : trailerUrl ? (
          <iframe
            src={trailerUrl}
            className="absolute inset-0 h-full w-full"
            allowFullScreen
            title="Film Fragmanı"
          ></iframe>
        ) : null}
      </div>
    </div>
  )
}
