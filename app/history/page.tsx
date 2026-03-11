"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Clock, Trash2, Film, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { useAuth } from "@/components/auth-provider"
import { MovieCard } from "@/components/movie-card"
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

// Tarih formatı için yardımcı fonksiyon
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString)
    return format(date, "d MMMM yyyy, HH:mm", { locale: tr })
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Geçersiz tarih"
  }
}

export default function HistoryPage() {
  const { user, removeFromHistory } = useAuth()
  const [itemToDelete, setItemToDelete] = useState<{ contentId: number; contentType: "movie" | "tv" } | null>(null)

  const handleDeleteItem = (contentId: number, contentType: "movie" | "tv") => {
    setItemToDelete({ contentId, contentType })
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      removeFromHistory(itemToDelete.contentId, itemToDelete.contentType)
      setItemToDelete(null)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <MainNav />
        </header>
        <main className="flex-1 container py-8 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Giriş Yapın</CardTitle>
              <CardDescription>Bu sayfayı görüntülemek için giriş yapmalısınız.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <MainNav />
      </header>

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">İzleme Geçmişi</h1>
        </div>

        {user.history && user.history.length > 0 ? (
          <div className="space-y-8">
            {/* Günlere göre gruplandırılmış izleme geçmişi */}
            {Object.entries(
              user.history.reduce<Record<string, typeof user.history>>((groups, item) => {
                // Tarihi gün bazında grupla (saat olmadan)
                const date = new Date(item.date)
                const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()

                if (!groups[day]) {
                  groups[day] = []
                }
                groups[day].push(item)
                return groups
              }, {}),
            )
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-xl font-semibold mb-4">
                    {new Date(date).toLocaleDateString("tr-TR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <div key={`${item.contentType}-${item.contentId}`} className="relative group">
                        <MovieCard
                          movie={{
                            id: item.contentId,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            releaseYear: "",
                            type: item.contentType,
                            rating: "0",
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-white text-sm">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(item.date).split(",")[1]}
                            </div>
                            <div className="flex items-center gap-2">
                              {item.contentType === "movie" ? (
                                <Film className="h-4 w-4 text-white" />
                              ) : (
                                <Tv className="h-4 w-4 text-white" />
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white hover:text-red-500"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleDeleteItem(item.contentId, item.contentType)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-center text-muted-foreground">İzleme geçmişiniz boş.</p>
              <Button className="mt-6" asChild>
                <Link href="/">İçerik Keşfet</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>İçeriği Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu içeriği izleme geçmişinizden silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
