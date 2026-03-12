"use client"

import { useState } from "react"
import { Heart, Eye, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface MovieActionsProps {
  type: "movie" | "tv"
  id: number
}

export function MovieActions({ type, id }: MovieActionsProps) {
  const [liked, setLiked] = useState(false)
  const [watched, setWatched] = useState(false)
  const [watchlist, setWatchlist] = useState(false)
  const { toast } = useToast()

  const handleLike = () => {
    // In a real app, this would call an API to save the user's preference
    setLiked(!liked)
    toast({
      title: liked ? "Beğeni kaldırıldı" : "Beğenildi",
      description: liked
        ? `${type === "movie" ? "Film" : "Dizi"} beğenilerinizden kaldırıldı.`
        : `${type === "movie" ? "Film" : "Dizi"} beğenilerinize eklendi.`,
    })
  }

  const handleWatched = () => {
    // In a real app, this would call an API to save the user's preference
    setWatched(!watched)
    toast({
      title: watched ? "İzlendi işareti kaldırıldı" : "İzlendi olarak işaretlendi",
      description: watched
        ? `${type === "movie" ? "Film" : "Dizi"} izlendi listenizden kaldırıldı.`
        : `${type === "movie" ? "Film" : "Dizi"} izlendi listenize eklendi.`,
    })
  }

  const handleWatchlist = () => {
    // In a real app, this would call an API to save the user's preference
    setWatchlist(!watchlist)
    toast({
      title: watchlist ? "İzleme listesinden kaldırıldı" : "İzleme listesine eklendi",
      description: watchlist
        ? `${type === "movie" ? "Film" : "Dizi"} izleme listenizden kaldırıldı.`
        : `${type === "movie" ? "Film" : "Dizi"} izleme listenize eklendi.`,
    })
  }

  return (
    <>
      <Button
        variant={liked ? "default" : "outline"}
        size="icon"
        onClick={handleLike}
        className={`rounded-full ${liked ? "bg-primary hover:bg-primary/90" : "bg-black/20 border-white/20 hover:bg-primary/20 hover:text-primary"}`}
      >
        <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
      </Button>
      <Button
        variant={watched ? "default" : "outline"}
        size="icon"
        onClick={handleWatched}
        className={`rounded-full ${watched ? "bg-primary hover:bg-primary/90" : "bg-black/20 border-white/20 hover:bg-primary/20 hover:text-primary"}`}
      >
        <Eye className="h-5 w-5" />
      </Button>
      <Button
        variant={watchlist ? "default" : "outline"}
        size="icon"
        onClick={handleWatchlist}
        className={`rounded-full ${watchlist ? "bg-primary hover:bg-primary/90" : "bg-black/20 border-white/20 hover:bg-primary/20 hover:text-primary"}`}
      >
        <Clock className="h-5 w-5" />
      </Button>
    </>
  )
}
