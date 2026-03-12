"use client"

import type React from "react"
import Image from "next/image"
import { Heart, MessageSquare, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { useLanguage } from "@/components/language-provider"
import { WatchStatusButtons } from "@/components/watch-status-buttons"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface Movie {
  id: number
  title: string
  posterUrl: string
  releaseYear: number | string
  type: "movie" | "tv"
  rating: number | string
  badge?: string
  trailerKey?: string
}

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { isLoggedIn, isLiked, addToLikes, removeFromLikes, addToHistory } = useAuth()
  const router = useRouter()

  // Beğeni durumunu kontrol et
  const liked = isLiked(movie.id, movie.type)

  // TMDB API'den gerçek poster URL'leri
  const posterUrl = movie.posterUrl

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "Beğenmek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (liked) {
      removeFromLikes(movie.id, movie.type)
      toast({
        title: "Beğeni kaldırıldı",
        description: `${movie.title} beğenilerinizden kaldırıldı.`,
      })
    } else {
      addToLikes(movie.id, movie.type, movie.title, posterUrl)
      toast({
        title: "Beğenildi",
        description: `${movie.title} beğenilerinize eklendi.`,
      })
    }
  }

  const handleLoginRedirect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push("/login")
  }

  const navigateToDetail = () => {
    // Add to history if logged in
    if (isLoggedIn) {
      addToHistory(movie.id, movie.type, movie.title, posterUrl)
    }

    // Navigate to the detail page
    router.push(`/${movie.type}/${movie.id}`)
  }

  return (
    <Card className="overflow-hidden border-border/40 movie-card-hover cursor-pointer" onClick={navigateToDetail}>
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={posterUrl || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        <Badge className="absolute top-2 right-2 bg-primary/80 hover:bg-primary">
          {movie.type === "movie" ? t("menu.movies") : t("menu.tvshows")}
        </Badge>
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
          <StarRating rating={Number(movie.rating) / 2} readOnly size="xs" />
          <span className="text-xs font-medium">{movie.rating}</span>
        </div>

        {movie.badge && (
          <div className="absolute bottom-2 left-2 bg-primary/80 rounded-full px-2 py-0.5">
            <span className="text-xs font-medium">{movie.badge}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-sm text-muted-foreground">{movie.releaseYear}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {isLoggedIn ? (
          <>
            <WatchStatusButtons
              size="sm"
              contentId={movie.id}
              contentType={movie.type}
              title={movie.title}
              posterUrl={posterUrl}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${liked ? "text-primary" : "hover:bg-primary/10 hover:text-primary"}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${liked ? "fill-primary" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" className="w-full" onClick={handleLoginRedirect}>
            <LogIn className="h-4 w-4 mr-2" />
            Giriş Yap
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
