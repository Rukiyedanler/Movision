"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Play, Heart, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/main-nav"
import { StarRating } from "@/components/star-rating"
import { WatchStatusButtons } from "@/components/watch-status-buttons"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getTvDetails, formatTvData, getTvVideos } from "@/lib/tmdb"
import { CommentSection } from "@/components/comment-section"
import { TrailerModal } from "@/components/trailer-modal"

export default function TvDetailPage({ params }: { params: { id: string } }) {
  const [tv, setTv] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [movisionRating, setMovisionRating] = useState(0)
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const { isLoggedIn, isLiked, addToLikes, removeFromLikes, getRating, addRating, getAllRatings, addToHistory } =
    useAuth()

  // Kullanıcının puanı
  const [userRating, setUserRating] = useState(0)
  // Beğeni durumu
  const [liked, setLiked] = useState(false)
  // Track if initial data is loaded
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false)

  // Memoize the TV ID to avoid unnecessary re-renders
  const tvId = useMemo(() => Number(params.id), [params.id])

  // Memoize the calculateMovisionRating function to avoid recreating it on every render
  const calculateMovisionRating = useCallback(
    (tvId: number, imdbRating: string) => {
      try {
        // Tüm kullanıcı puanlarını al
        const allUserRatings = getAllRatings(tvId, "tv")

        // IMDb puanını 10 üzerinden 5 üzerine çevir
        const imdbRatingNormalized = Number.parseFloat(imdbRating) / 2

        if (allUserRatings && allUserRatings.length > 0) {
          // Kullanıcı puanlarının ortalamasını al
          const userRatingsAvg = allUserRatings.reduce((sum, rating) => sum + rating, 0) / allUserRatings.length

          // IMDb puanı ile kullanıcı puanlarının ortalamasını al
          return (imdbRatingNormalized + userRatingsAvg) / 2
        } else {
          // Kullanıcı puanı yoksa IMDb puanını göster
          return imdbRatingNormalized
        }
      } catch (error) {
        console.error("Error calculating Movision rating:", error)
        return Number.parseFloat(imdbRating) / 2 // Fallback to IMDb rating
      }
    },
    [getAllRatings],
  )

  // Fetch TV details only once when the component mounts or tvId changes
  useEffect(() => {
    let isMounted = true

    async function fetchTvDetails() {
      if (!isMounted) return

      try {
        setIsLoading(true)

        // TMDB API'den dizi detaylarını çek
        const tvData = await getTvDetails(tvId)

        if (!isMounted) return

        // If no videos in the TV data, fetch them separately
        let videosData = null
        if (!tvData.videos || !tvData.videos.results || tvData.videos.results.length === 0) {
          videosData = await getTvVideos(tvId)
          if (videosData && videosData.results) {
            tvData.videos = videosData
          }
        }

        if (!isMounted) return

        const formattedTv = formatTvData(tvData)

        if (!formattedTv) {
          console.error("TV show data could not be formatted")
          return
        }

        setTv(formattedTv)

        // Calculate initial Movision rating only if we have a valid rating
        if (formattedTv.rating) {
          const initialRating = calculateMovisionRating(tvId, formattedTv.rating)
          setMovisionRating(initialRating)
        }

        setIsInitialDataLoaded(true)
      } catch (error) {
        console.error("Error fetching TV details:", error)
        if (isMounted) {
          setIsInitialDataLoaded(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTvDetails()

    return () => {
      isMounted = false
    }
  }, [tvId, calculateMovisionRating]) // Only depend on tvId and the memoized function

  // Separate effect for user-specific data that only runs after initial data is loaded
  useEffect(() => {
    if (!isLoggedIn || !tv || !isInitialDataLoaded) return

    // Add to history only once when the TV show loads
    addToHistory(tvId, "tv", tv.title, tv.posterUrl)

    // Get user rating
    const rating = getRating(tvId, "tv")
    setUserRating(rating)

    // Check if liked
    setLiked(isLiked(tvId, "tv"))
  }, [isLoggedIn, tv, tvId, isInitialDataLoaded, addToHistory, getRating, isLiked])

  const handleLike = useCallback(() => {
    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "Beğenmek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!tv) return

    if (liked) {
      removeFromLikes(tv.id, "tv")
      setLiked(false)
      toast({
        title: "Beğeni kaldırıldı",
        description: `${tv.title} beğenilerinizden kaldırıldı.`,
      })
    } else {
      addToLikes(tv.id, "tv", tv.title, tv.posterUrl)
      setLiked(true)
      toast({
        title: "Beğenildi",
        description: `${tv.title} beğenilerinize eklendi.`,
      })
    }
  }, [isLoggedIn, tv, liked, toast, router, removeFromLikes, addToLikes])

  const handleRatingChange = useCallback(
    (rating: number) => {
      if (!isLoggedIn) {
        toast({
          title: "Giriş Gerekli",
          description: "Puanlama yapmak için giriş yapmalısınız.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      if (!tv) return

      setUserRating(rating)
      addRating(tv.id, "tv", rating)

      toast({
        title: "Puanlama Başarılı",
        description: `${tv.title} için ${rating}/5 puan verdiniz.`,
      })

      // Update Movision rating after user rates
      if (tv.rating) {
        const newRating = calculateMovisionRating(tv.id, tv.rating)
        setMovisionRating(newRating)
      }
    },
    [isLoggedIn, tv, toast, router, addRating, calculateMovisionRating],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 bg-background">
          <MainNav />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!tv) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 bg-background">
          <MainNav />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Dizi bulunamadı</h1>
            <p className="text-muted-foreground mb-4">İstediğiniz dizi bulunamadı veya bir hata oluştu.</p>
            <Button onClick={() => router.push("/")}>Ana Sayfaya Dön</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-transparent">
        <MainNav />
      </header>

      <main className="flex-1">
        {/* Hero Section with Backdrop */}
        <div className="relative h-[60vh] w-full">
          <Image
            src={tv.backdropUrl || "/placeholder.svg"}
            alt={tv.title}
            fill
            className="object-cover brightness-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-black/20" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("movie.back")}
            </Button>
            <div className="flex items-end gap-6">
              <div className="relative h-48 w-32 overflow-hidden rounded-md shadow-lg">
                <Image src={tv.posterUrl || "/placeholder.svg"} alt={tv.title} fill className="object-cover" priority />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{tv.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/80 hover:bg-primary">{tv.releaseYear}</Badge>
                  <Badge className="bg-primary/80 hover:bg-primary">{tv.seasons} Sezon</Badge>
                  <div className="flex items-center bg-black/40 px-2 py-0.5 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{tv.rating}/10</span>
                  </div>
                </div>
                {/* In the hero section, make sure the trailer button is displayed */}
                <div className="flex gap-2 mt-4">
                  {tv.trailerUrl && (
                    <Button onClick={() => setShowTrailer(true)} className="gap-2 bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4" />
                      {t("movie.watchTrailer")}
                    </Button>
                  )}

                  {isLoggedIn ? (
                    <>
                      <WatchStatusButtons
                        contentId={tv.id}
                        contentType="tv"
                        title={tv.title}
                        posterUrl={tv.posterUrl}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full bg-black/20 border-white/20 ${liked ? "text-primary border-primary" : "hover:bg-primary/20 hover:text-primary"}`}
                        onClick={handleLike}
                      >
                        <Heart className={`h-5 w-5 ${liked ? "fill-primary" : ""}`} />
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => router.push("/login")} className="gap-2">
                      <LogIn className="h-4 w-4" />
                      Giriş Yap
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="container py-8">
          <Tabs defaultValue="about">
            <TabsList className="mb-6">
              <TabsTrigger value="about">{t("movie.about")}</TabsTrigger>
              <TabsTrigger value="cast">{t("movie.cast")}</TabsTrigger>
              <TabsTrigger value="comments">{t("movie.comments")}</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{t("movie.summary")}</h2>
                <p>{tv.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t("movie.details")}</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Yaratıcı</dt>
                      <dd>{tv.creator}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Yayıncı</dt>
                      <dd>{tv.studio}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">İlk Yayın Yılı</dt>
                      <dd>{tv.releaseYear}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Sezon Sayısı</dt>
                      <dd>{tv.seasons}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Bölüm Sayısı</dt>
                      <dd>{tv.episodes}</dd>
                    </div>
                    {tv.genres && tv.genres.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Türler</dt>
                        <dd className="text-right">{tv.genres.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("movie.imdbRating")}</h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Number(tv.rating) / 2} readOnly size="lg" />
                      <span className="text-xl font-bold">{tv.rating}/10</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("movie.yourRating")}</h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={userRating} onChange={handleRatingChange} size="lg" />
                      <span className="text-xl font-bold">{userRating ? `${userRating}/5` : "-"}</span>
                    </div>
                  </div>

                  {movisionRating > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Movision Puanı</h3>
                      <div className="flex items-center gap-2">
                        <StarRating rating={movisionRating} readOnly size="lg" />
                        <span className="text-xl font-bold">{movisionRating.toFixed(1)}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Önerilen Diziler */}
              {tv.recommendations && tv.recommendations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Benzer Diziler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {tv.recommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="cursor-pointer"
                        onClick={() => {
                          router.push(`/tv/${rec.id}`)
                        }}
                      >
                        <div className="relative aspect-[2/3] rounded-md overflow-hidden">
                          <Image
                            src={rec.posterUrl || "/placeholder.svg"}
                            alt={rec.title}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </div>
                        <h4 className="mt-2 text-sm font-medium line-clamp-1">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground">{rec.releaseYear}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cast">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {tv.cast && tv.cast.length > 0 ? (
                  tv.cast.map((actor: any, index: number) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="relative h-32 w-32 overflow-hidden rounded-full mb-3">
                        <Image
                          src={actor.imageUrl || "/placeholder.svg"}
                          alt={actor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-medium">{actor.name}</h3>
                      <p className="text-sm text-muted-foreground">{actor.character}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-8">
                    <p className="text-muted-foreground">Oyuncu bilgisi bulunamadı.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection contentId={params.id} contentType="tv" />
            </TabsContent>
          </Tabs>
        </div>
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

      {/* Trailer Modal */}
      {tv.trailerUrl && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={tv.title}
          trailerKey={tv.trailerUrl}
        />
      )}
    </div>
  )
}
