"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TrailerModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  trailerKey: string
}

export function TrailerModal({ isOpen, onClose, title, trailerKey }: TrailerModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-5xl">
        <Button
          className="absolute -top-12 right-0 z-10"
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="relative aspect-video w-full">
          {trailerKey ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              className="absolute inset-0 h-full w-full rounded-lg"
              allowFullScreen
              title={`${title} Fragmanı`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-lg mb-4">Bu içerik için fragman bulunamadı.</p>
                <Button onClick={onClose}>Geri Dön</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
