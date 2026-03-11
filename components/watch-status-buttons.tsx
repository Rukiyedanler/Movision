"use client"

import { useState, useEffect } from "react"
import { Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

interface WatchStatusButtonsProps {
  size?: "sm" | "md" | "lg"
  className?: string
  contentId?: number
  contentType?: "movie" | "tv"
  title?: string
  posterUrl?: string
}

export function WatchStatusButtons({
  size = "md",
  className,
  contentId,
  contentType,
  title,
  posterUrl,
}: WatchStatusButtonsProps) {
  const { toast } = useToast()
  const { t } = useLanguage()
  const { isLoggedIn, isWatched, isInWatchlist, addToWatched, removeFromWatched, addToWatchlist, removeFromWatchlist } =
    useAuth()
  const router = useRouter()

  // Durum kontrolü
  const [watched, setWatched] = useState(false)
  const [watchlist, setWatchlist] = useState(false)

  // contentId ve contentType değiştiğinde durumları güncelle
  useEffect(() => {
    if (contentId && contentType && isLoggedIn) {
      setWatched(isWatched(contentId, contentType))
      setWatchlist(isInWatchlist(contentId, contentType))
    }
  }, [contentId, contentType, isLoggedIn, isWatched, isInWatchlist])

  const handleWatched = () => {
    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "İzlendi olarak işaretlemek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!contentId || !contentType || !title || !posterUrl) {
      console.error("Missing content information")
      return
    }

    if (watched) {
      removeFromWatched(contentId, contentType)
      setWatched(false)
      toast({
        title: "İzlendi işareti kaldırıldı",
        description: "İçerik izlendi listenizden kaldırıldı.",
      })
    } else {
      addToWatched(contentId, contentType, title, posterUrl)
      setWatched(true)
      toast({
        title: "İzlendi olarak işaretlendi",
        description: "İçerik izlendi listenize eklendi.",
      })
    }
  }

  const handleWatchlist = () => {
    if (!isLoggedIn) {
      toast({
        title: "Giriş Gerekli",
        description: "İzleme listesine eklemek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!contentId || !contentType || !title || !posterUrl) {
      console.error("Missing content information")
      return
    }

    if (watchlist) {
      removeFromWatchlist(contentId, contentType)
      setWatchlist(false)
      toast({
        title: "İzleme listesinden kaldırıldı",
        description: "İçerik izleme listenizden kaldırıldı.",
      })
    } else {
      addToWatchlist(contentId, contentType, title, posterUrl)
      setWatchlist(true)
      toast({
        title: "İzleme listesine eklendi",
        description: "İçerik izleme listenize eklendi.",
      })
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-8 text-xs"
      case "md":
        return "h-10 text-sm"
      case "lg":
        return "h-12 text-base"
      default:
        return "h-10 text-sm"
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant={watched ? "default" : "outline"}
        size="sm"
        onClick={handleWatched}
        className={cn(
          getButtonSize(),
          "rounded-full flex items-center gap-1.5",
          watched ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary hover:border-primary",
        )}
      >
        <Eye className={cn("h-4 w-4", watched && "fill-current")} />
        <span>{t("movie.watched")}</span>
      </Button>
      <Button
        variant={watchlist ? "default" : "outline"}
        size="sm"
        onClick={handleWatchlist}
        className={cn(
          getButtonSize(),
          "rounded-full flex items-center gap-1.5",
          watchlist ? "bg-primary hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary hover:border-primary",
        )}
      >
        <Clock className={cn("h-4 w-4", watchlist && "fill-current")} />
        <span>{t("movie.watchlist")}</span>
      </Button>
    </div>
  )
}
