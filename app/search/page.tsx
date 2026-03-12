"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { MovieCard } from "@/components/movie-card"
import {
  searchMulti,
  formatSearchResult,
  discoverMovies,
  discoverTvShows,
  formatMovieListItem,
  formatTvListItem,
} from "@/lib/tmdb"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || undefined
  const page = searchParams.get("page") || "1"
  const type = searchParams.get("type")
  const yearFrom = searchParams.get("year_from")
  const yearTo = searchParams.get("year_to")
  const durationFrom = searchParams.get("duration_from")
  const durationTo = searchParams.get("duration_to")
  const genres = searchParams.get("genres")

  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determine the title based on search parameters
  let title = "Arama"
  if (query) {
    title = `"${query}" için arama sonuçları`
  } else if (type || yearFrom || yearTo || durationFrom || durationTo || genres) {
    title = "Filtrelenmiş İçerikler"
  }

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true)
      setError(null)

      try {
        // If we have a query, perform a text search
        if (query) {
          const data = await searchMulti(query, Number.parseInt(page))
          const formattedResults = data.results
            .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
            .map((item: any) => formatSearchResult(item))
            .filter(Boolean)

          setResults(formattedResults)
        }
        // If we have filters but no query, perform a discover search
        else if (type || yearFrom || yearTo || durationFrom || durationTo || genres) {
          let searchResults: any[] = []

          // Convert filter parameters
          const genreIds = genres ? genres.split(",").map((id) => Number.parseInt(id)) : []
          const yearFromNum = yearFrom ? Number.parseInt(yearFrom) : undefined
          const yearToNum = yearTo ? Number.parseInt(yearTo) : undefined
          const durationFromNum = durationFrom ? Number.parseInt(durationFrom) : undefined
          const durationToNum = durationTo ? Number.parseInt(durationTo) : undefined

          // Prepare parameters for API calls
          const movieParams: Record<string, string | number> = {
            page: Number.parseInt(page),
            sort_by: "popularity.desc",
          }

          const tvParams: Record<string, string | number> = {
            page: Number.parseInt(page),
            sort_by: "popularity.desc",
          }

          // Add year filter
          if (yearFromNum) {
            movieParams["primary_release_date.gte"] = `${yearFromNum}-01-01`
            tvParams["first_air_date.gte"] = `${yearFromNum}-01-01`
          }

          if (yearToNum) {
            movieParams["primary_release_date.lte"] = `${yearToNum}-12-31`
            tvParams["first_air_date.lte"] = `${yearToNum}-12-31`
          }

          // Add genre filter
          if (genreIds.length > 0) {
            movieParams["with_genres"] = genreIds.join(",")
            tvParams["with_genres"] = genreIds.join(",")
          }

          // Add runtime filter (only for movies)
          if (durationFromNum) {
            movieParams["with_runtime.gte"] = durationFromNum
          }

          if (durationToNum) {
            movieParams["with_runtime.lte"] = durationToNum
          }

          // Fetch results based on type
          if (type === "all" || !type || type === "movie") {
            const movieData = await discoverMovies(movieParams)
            const formattedMovies = movieData.results.map((movie: any) => formatMovieListItem(movie)).filter(Boolean)
            searchResults = [...searchResults, ...formattedMovies.map((item: any) => ({ ...item, type: "movie" }))]
          }

          if (type === "all" || !type || type === "tv") {
            const tvData = await discoverTvShows(tvParams)
            const formattedTvShows = tvData.results.map((tv: any) => formatTvListItem(tv)).filter(Boolean)
            searchResults = [...searchResults, ...formattedTvShows.map((item: any) => ({ ...item, type: "tv" }))]
          }

          // Sort by popularity
          searchResults.sort((a, b) => b.popularity - a.popularity)

          setResults(searchResults)
        } else {
          setResults([])
        }
      } catch (error) {
        console.error("Search error:", error)
        setError("Arama yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, page, type, yearFrom, yearTo, durationFrom, durationTo, genres])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[350px] rounded-lg bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Bir hata oluştu</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            {query ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Sonuç bulunamadı</h2>
                <p className="text-muted-foreground">
                  "{query}" için sonuç bulunamadı. Farklı bir arama terimi deneyin.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  {type || yearFrom || yearTo || durationFrom || durationTo || genres
                    ? "Sonuç bulunamadı"
                    : "Arama yapmak için bir terim girin"}
                </h2>
                <p className="text-muted-foreground">
                  {type || yearFrom || yearTo || durationFrom || durationTo || genres
                    ? "Seçtiğiniz filtrelere uygun içerik bulunamadı. Lütfen filtrelerinizi değiştirin."
                    : "Film veya dizi adı yazarak arama yapabilirsiniz."}
                </p>
              </>
            )}
            <div className="mt-8">
              <Link href="/">
                <Button>Ana Sayfaya Dön</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((item: any) => (
              <MovieCard key={`${item.type}-${item.id}`} movie={item} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Movision+. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
}
