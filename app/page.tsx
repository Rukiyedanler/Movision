"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, Calendar, Film, Tv, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MovieCard } from "@/components/movie-card"
import { MainNav } from "@/components/main-nav"
import { useLanguage } from "@/components/language-provider"
import { Card } from "@/components/ui/card"
import { TrailerModal } from "@/components/trailer-modal"
import {
  getTrending,
  getPopularMovies,
  getPopularTvShows,
  getUpcomingMovies,
  formatMovieListItem,
  formatTvListItem,
  getMovieDetails,
} from "@/lib/tmdb"

// Arka plan görselleri
const backgroundImages = [
  "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", // Dune
  "https://image.tmdb.org/t/p/original/yF1eOkaYvwiORauRCPWznV9xVvi.jpg", // Interstellar
  "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", // Inception
  "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", // Dark Knight
  "https://image.tmdb.org/t/p/original/uozb2VeD87YmhoUP1RrGWfzuCrr.jpg", // Joker
]

// TMDB API Anahtarı
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const router = useRouter()
  const { t } = useLanguage()

  // Arka plan görselini belirli aralıklarla değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 8000) // 8 saniyede bir değiştir

    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden light-beam">
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-2000 ${
            index === currentBgIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: "2000ms" }}
        >
          <Image src={image || "/placeholder.svg"} alt="Hero background" fill className="object-cover brightness-50" />
        </div>
      ))}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white max-w-3xl">{t("home.hero.title")}</h1>
        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">{t("home.hero.subtitle")}</p>
        <form onSubmit={handleSearch} className="w-full max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("search.placeholder")}
              className="w-full pl-10 pr-4 h-12 bg-background/80 backdrop-blur border-primary/20 focus-visible:border-primary text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9">
              {t("search.button")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TrailerSection() {
  const [selectedTrailer, setSelectedTrailer] = useState<{
    isOpen: boolean
    title: string
    trailerKey: string
  }>({
    isOpen: false,
    title: "",
    trailerKey: "",
  })
  const [trailers, setTrailers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchTrailers() {
      try {
        setIsLoading(true)
        // Trend filmlerden fragmanları al
        const trendingData = await getTrending("movie", "week")

        // Fragmanı olan filmleri filtrele
        const moviesWithTrailers = trendingData.results
          .slice(0, 10)
          .map((movie: any) => formatMovieListItem(movie))
          .filter((movie: any) => movie && movie.posterUrl !== "/placeholder.svg?height=450&width=300")

        // Her film için detayları ve fragmanları al
        const trailerPromises = moviesWithTrailers.map(async (movie: any) => {
          try {
            const movieDetails = await getMovieDetails(movie.id)

            // Fragman bul
            let trailerKey = null
            if (movieDetails.videos && movieDetails.videos.results && movieDetails.videos.results.length > 0) {
              // Önce Türkçe fragman ara
              const trTrailer = movieDetails.videos.results.find(
                (video: any) =>
                  (video.type === "Trailer" || video.type === "Teaser") &&
                  video.site === "YouTube" &&
                  video.iso_639_1 === "tr",
              )

              // Türkçe fragman yoksa herhangi bir fragman ara
              const anyTrailer = movieDetails.videos.results.find(
                (video: any) => (video.type === "Trailer" || video.type === "Teaser") && video.site === "YouTube",
              )

              trailerKey = trTrailer?.key || anyTrailer?.key || null
            }

            if (trailerKey) {
              return {
                id: movie.id,
                title: movie.title,
                thumbnailUrl: `https://image.tmdb.org/t/p/w780${movieDetails.backdrop_path || movieDetails.poster_path}`,
                trailerKey: trailerKey,
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching trailer for movie ${movie.id}:`, error)
            return null
          }
        })

        const trailerResults = await Promise.all(trailerPromises)
        setTrailers(trailerResults.filter(Boolean).slice(0, 3))
      } catch (error) {
        console.error("Error fetching trailers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrailers()
  }, [])

  return (
    <>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[200px] rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trailers.map((trailer) => (
            <Card
              key={trailer.id}
              className="overflow-hidden cursor-pointer group"
              onClick={() =>
                setSelectedTrailer({
                  isOpen: true,
                  title: trailer.title,
                  trailerKey: trailer.trailerKey,
                })
              }
            >
              <div className="relative aspect-video">
                <Image
                  src={trailer.thumbnailUrl || "/placeholder.svg"}
                  alt={trailer.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-primary/80 p-4">
                    <Play className="h-8 w-8 fill-white text-white" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium">{trailer.title}</h3>
                <p className="text-sm text-muted-foreground">{t("movie.watchTrailer")}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <TrailerModal
        isOpen={selectedTrailer.isOpen}
        onClose={() => setSelectedTrailer({ ...selectedTrailer, isOpen: false })}
        title={selectedTrailer.title}
        trailerKey={selectedTrailer.trailerKey}
      />
    </>
  )
}

export default function Home() {
  const [trendingMovies, setTrendingMovies] = useState<any[]>([])
  const [trendingTvShows, setTrendingTvShows] = useState<any[]>([])
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Trend filmleri al
        const moviesData = await getPopularMovies()
        const formattedMovies = moviesData.results
          .map((movie: any) => formatMovieListItem(movie))
          .filter((movie: any) => movie && movie.posterUrl !== "/placeholder.svg?height=450&width=300")
          .slice(0, 4)

        // Trend dizileri al
        const tvShowsData = await getPopularTvShows()
        const formattedTvShows = tvShowsData.results
          .map((tv: any) => formatTvListItem(tv))
          .filter((tv: any) => tv && tv.posterUrl !== "/placeholder.svg?height=450&width=300")
          .slice(0, 4)

        // Yakında çıkacak filmleri al
        const upcomingData = await getUpcomingMovies()
        const formattedUpcoming = upcomingData.results
          .map((movie: any) => formatMovieListItem(movie))
          .filter((movie: any) => movie && movie.posterUrl !== "/placeholder.svg?height=450&width=300")
          .slice(0, 4)

        setTrendingMovies(formattedMovies)
        setTrendingTvShows(formattedTvShows)
        setUpcomingMovies(formattedUpcoming)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-transparent">
        <MainNav />
      </header>

      <HeroSection />

      <main className="flex-1">
        {/* Popüler Fragmanlar */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="scroll-section">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Play className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">{t("home.popularTrailers")}</h2>
                </div>
              </div>

              <TrailerSection />
            </div>
          </div>
        </section>

        {/* Trend Filmler */}
        <section className="py-12">
          <div className="container">
            <div className="scroll-section">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Film className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">{t("home.trendingMovies")}</h2>
                </div>
                <Link href="/movies">
                  <Button variant="ghost" className="gap-1">
                    <span>{t("home.viewall")}</span>
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-[350px] rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Trend Diziler */}
        <section className="py-12 bg-muted/30">
          <div className="container">
            <div className="scroll-section">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Tv className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">{t("home.trendingTvShows")}</h2>
                </div>
                <Link href="/tv-shows">
                  <Button variant="ghost" className="gap-1">
                    <span>{t("home.viewall")}</span>
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-[350px] rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {trendingTvShows.map((show) => (
                    <MovieCard key={show.id} movie={show} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Vizyona Girecek Filmler */}
        <section className="py-12">
          <div className="container">
            <div className="scroll-section">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">{t("home.upcomingMovies")}</h2>
                </div>
                <Link href="/movies?filter=upcoming">
                  <Button variant="ghost" className="gap-1">
                    <span>{t("home.viewall")}</span>
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-[350px] rounded-lg bg-muted/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {upcomingMovies.map((movie) => (
                    <MovieCard key={movie.id} movie={{ ...movie, badge: movie.releaseDate }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-primary">MOVISION+</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} MOVISION+. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  )
}
