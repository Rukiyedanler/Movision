"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Play, Heart, LogIn, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MainNav } from "@/components/main-nav"
import { CommentSection } from "@/components/comment-section"
import { TrailerModal } from "@/components/trailer-modal"
import { StarRating } from "@/components/star-rating"
import { WatchStatusButtons } from "@/components/watch-status-buttons"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getMovieDetails, formatMovieData, getMovieVideos } from "@/lib/tmdb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const [movie, setMovie] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [movisionRating, setMovisionRating] = useState(0)
  const [activeTab, setActiveTab] = useState("about")
  const [isRemoveRatingDialogOpen, setIsRemoveRatingDialogOpen] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const {
    isLoggedIn,
    isLiked,
    addToLikes,
    removeFromLikes,
    getRating,
    addRating,
    removeRating,
    getAllRatings,
    addToHistory,
  } = useAuth()

  // Kullanıcının puanı
  const [userRating, setUserRating] = useState(0)
  // Beğeni durumu
  const [liked, setLiked] = useState(false)
  // User data loaded flag
  const [userDataLoaded, setUserDataLoaded] = useState(false)
  // Scroll position reference
  const scrollPositionRef = useRef(0)
  // Main content ref
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Memoize the movie ID to avoid unnecessary re-renders
  const movieId = useMemo(() => Number(params.id), [params.id])

  // Save scroll position before re-render
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Restore scroll position after re-render
  useEffect(() => {
    if (!isLoading && movie) {
      window.scrollTo(0, scrollPositionRef.current)
    }
  }, [isLoading, movie, activeTab])

  // Calculate Movision rating without triggering re-renders
  const calculateMovisionRating = useCallback(
    (movieId: number, imdbRating: string) => {
      if (!imdbRating) return 0

      // Tüm kullanıcı puanlarını al
      const allUserRatings = getAllRatings(movieId, "movie")

      // IMDb puanını 10 üzerinden 5 üzerine çevir
      const imdbRatingNormalized = Number.parseFloat(imdbRating) / 2

      if (allUserRatings.length > 0) {
        // Kullanıcı puanlarının ortalamasını al
        const userRatingsAvg = allUserRatings.reduce((sum, rating) => sum + rating, 0) / allUserRatings.length

        // IMDb puanı ile kullanıcı puanlarının ortalamasını al
        return (imdbRatingNormalized + userRatingsAvg) / 2
      } else {
        // Kullanıcı puanı yoksa IMDb puanını göster
        return imdbRatingNormalized
      }
    },
    [getAllRatings],
  )

  // Main effect for fetching movie data
  useEffect(() => {
    let isMounted = true

    async function fetchMovieDetails() {
      try {
        setIsLoading(true)

        // TMDB API'den film detaylarını çek
        const movieData = await getMovieDetails(movieId)

        // If no videos in the movie data, fetch them separately
        let formattedMovie

        if (!movieData.videos || !movieData.videos.results || movieData.videos.results.length === 0) {
          try {
            const videosData = await getMovieVideos(movieId)
            if (videosData && videosData.results) {
              movieData.videos = videosData
            }
          } catch (videoError) {
            console.error("Error fetching video data:", videoError)
          }
        }

        formattedMovie = formatMovieData(movieData)

        if (!formattedMovie) {
          console.error("Movie data could not be formatted")
          if (isMounted) setIsLoading(false)
          return
        }

        if (isMounted) {
          setMovie(formattedMovie)

          // Calculate initial Movision rating
          if (formattedMovie.rating) {
            const initialRating = calculateMovisionRating(movieId, formattedMovie.rating)
            setMovisionRating(initialRating)
          }

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error fetching movie details:", error)
        if (isMounted) setIsLoading(false)
      }
    }

    fetchMovieDetails()

    return () => {
      isMounted = false
    }
  }, [movieId, calculateMovisionRating])

  // Separate effect for user-specific data
  useEffect(() => {
    if (!isLoggedIn || !movie || userDataLoaded) return

    // Add to history only once when the movie loads
    try {
      addToHistory(movieId, "movie", movie.title, movie.posterUrl)

      // Get user rating
      const rating = getRating(movieId, "movie")
      setUserRating(rating)

      // Check if liked
      setLiked(isLiked(movieId, "movie"))

      setUserDataLoaded(true)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [isLoggedIn, movie, movieId, userDataLoaded, addToHistory, getRating, isLiked])

  const handleLike = () => {
    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "Beğenmek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!movie) return

    if (liked) {
      removeFromLikes(movie.id, "movie")
      setLiked(false)
      toast({
        title: "Beğeni kaldırıldı",
        description: `${movie.title} beğenilerinizden kaldırıldı.`,
      })
    } else {
      addToLikes(movie.id, "movie", movie.title, movie.posterUrl)
      setLiked(true)
      toast({
        title: "Beğenildi",
        description: `${movie.title} beğenilerinize eklendi.`,
      })
    }
  }

  const handleRatingChange = (rating: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "Puanlama yapmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!movie) return

    setUserRating(rating)
    addRating(movie.id, "movie", rating)

    toast({
      title: "Puanlama Başarılı",
      description: `${movie.title} için ${rating}/5 puan verdiniz.`,
    })

    // Update Movision rating after user rates
    if (movie.rating) {
      const newRating = calculateMovisionRating(movie.id, movie.rating)
      setMovisionRating(newRating)
    }
  }

  const confirmRemoveRating = () => {
    setIsRemoveRatingDialogOpen(true)
  }

  const handleRemoveRating = () => {
    if (!isLoggedIn || !movie) return

    removeRating(movie.id, "movie")
    setUserRating(0)

    // Update Movision rating after removing user rating
    if (movie.rating) {
      const newRating = calculateMovisionRating(movie.id, movie.rating)
      setMovisionRating(newRating)
    }

    toast({
      title: "Puanlama Kaldırıldı",
      description: `${movie.title} için puanlamanız kaldırıldı.`,
    })

    setIsRemoveRatingDialogOpen(false)
  }

  const handleTabChange = (value: string) => {
    // Save current scroll position before tab change
    scrollPositionRef.current = window.scrollY
    setActiveTab(value)
  }

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

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 bg-background">
          <MainNav />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Film bulunamadı</h1>
            <p className="text-muted-foreground mb-4">İstediğiniz film bulunamadı veya bir hata oluştu.</p>
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

      <main className="flex-1" ref={mainContentRef}>
        {/* Hero Section with Backdrop */}
        <div className="relative h-[60vh] w-full">
          <Image
            src={movie.backdropUrl || "/placeholder.svg"}
            alt={movie.title}
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
                <Image
                  src={movie.posterUrl || "/placeholder.svg"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{movie.title}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-primary/80 hover:bg-primary">{movie.releaseYear}</Badge>
                  <Badge className="bg-primary/80 hover:bg-primary">{movie.duration}</Badge>
                  <div className="flex items-center bg-black/40 px-2 py-0.5 rounded-full">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{movie.rating}/10</span>
                  </div>
                </div>
                {/* In the hero section, make sure the trailer button is displayed */}
                <div className="flex gap-2 mt-4">
                  {movie.trailerUrl && (
                    <Button onClick={() => setShowTrailer(true)} className="gap-2 bg-primary hover:bg-primary/90">
                      <Play className="h-4 w-4" />
                      {t("movie.watchTrailer")}
                    </Button>
                  )}

                  {isLoggedIn ? (
                    <>
                      <WatchStatusButtons
                        contentId={movie.id}
                        contentType="movie"
                        title={movie.title}
                        posterUrl={movie.posterUrl}
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
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="about">{t("movie.about")}</TabsTrigger>
              <TabsTrigger value="cast">{t("movie.cast")}</TabsTrigger>
              <TabsTrigger value="comments">{t("movie.comments")}</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">{t("movie.summary")}</h2>
                <p>{movie.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t("movie.details")}</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("movie.director")}</dt>
                      <dd>{movie.director}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("movie.studio")}</dt>
                      <dd>{movie.studio}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("movie.releaseYear")}</dt>
                      <dd>{movie.releaseYear}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">{t("movie.duration")}</dt>
                      <dd>{movie.duration}</dd>
                    </div>
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Türler</dt>
                        <dd className="text-right">{movie.genres.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("movie.imdbRating")}</h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Number(movie.rating) / 2} readOnly size="lg" />
                      <span className="text-xl font-bold">{movie.rating}/10</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">{t("movie.yourRating")}</h3>
                    <div className="flex items-center gap-2">
                      <StarRating rating={userRating} onChange={handleRatingChange} size="lg" />
                      <span className="text-xl font-bold">{userRating ? `${userRating}/5` : "-"}</span>
                      {userRating > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 text-red-500 hover:text-red-700"
                          onClick={confirmRemoveRating}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Puanı Kaldır
                        </Button>
                      )}
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

              {/* Önerilen Filmler */}
              {movie.recommendations && movie.recommendations.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Benzer Filmler</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {movie.recommendations.map((rec: any) => (
                      <div
                        key={rec.id}
                        className="cursor-pointer"
                        onClick={() => {
                          router.push(`/movie/${rec.id}`)
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
                {movie.cast.map((actor: any, index: number) => (
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
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <CommentSection contentId={params.id} contentType="movie" title={movie.title} />
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
      {movie.trailerUrl && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          title={movie.title}
          trailerKey={movie.trailerUrl}
        />
      )}

      {/* Remove Rating Confirmation Dialog */}
      <AlertDialog open={isRemoveRatingDialogOpen} onOpenChange={setIsRemoveRatingDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Puanlamayı Kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              Bu film için verdiğiniz puanı kaldırmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveRating}>Puanı Kaldır</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
