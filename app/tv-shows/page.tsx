"use client"

import { useState, useEffect } from "react"
import { MainNav } from "@/components/main-nav"
import { MovieCard } from "@/components/movie-card"
import { useLanguage } from "@/components/language-provider"
import { getPopularTvShows, formatTvListItem } from "@/lib/tmdb"
import { Button } from "@/components/ui/button"

export default function TvShowsPage() {
  const [tvShows, setTvShows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    async function fetchTvShows() {
      try {
        setIsLoading(true)
        const data = await getPopularTvShows(page)

        const formattedTvShows = data.results
          .map((tv: any) => formatTvListItem(tv))
          .filter((tv: any) => tv && tv.posterUrl !== "/placeholder.svg?height=450&width=300")

        if (page === 1) {
          setTvShows(formattedTvShows)
        } else {
          setTvShows((prev) => [...prev, ...formattedTvShows])
        }

        // Daha fazla sayfa var mı kontrol et
        setHasMore(data.page < data.total_pages)
      } catch (error) {
        console.error("Error fetching TV shows:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTvShows()
  }, [page])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <MainNav />
      </header>
      <main className="flex-1">
        <section className="py-12">
          <div className="container">
            <h1 className="text-4xl font-bold tracking-tight mb-8">Popüler Diziler</h1>

            {isLoading && tvShows.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="h-[350px] rounded-lg bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {tvShows.map((show) => (
                    <MovieCard key={show.id} movie={show} />
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={loadMore} disabled={isLoading} className="min-w-[200px]">
                      {isLoading ? "Yükleniyor..." : "Daha Fazla Göster"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
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
