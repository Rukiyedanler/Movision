"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera, Save, History, Heart, Bookmark, MessageSquare, Star, Trash2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNav } from "@/components/main-nav"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"
import { MovieCard } from "@/components/movie-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
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

// Avatar seçenekleri
const avatarOptions = [
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-05-13%20172132-OhShIZpjSVNROkEBOjMGX9x03ziSIT.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-05-13%20172202-mQeugs49j2NWx7Atb6q2KLKF1BPws4.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-05-13%20172224-no3ROZhGBMRkAESVVG4AF14Hx2OJgT.png",
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ekran%20g%C3%B6r%C3%BCnt%C3%BCs%C3%BC%202025-05-13%20172255-p9LRfSlTQhlr1EgbiXEXVyjyVr3uaY.png",
]

export default function ProfilePage() {
  const { user, updateUserAvatar, updateUserName, removeComment, removeRating, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("/placeholder.svg?height=200&width=200")
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { t } = useLanguage()
  const [commentToDelete, setCommentToDelete] = useState<{ contentId: number; contentType: "movie" | "tv" } | null>(
    null,
  )
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // User data'sını güncelle
  useEffect(() => {
    if (user) {
      setUsername(user.name || "")
      setEmail(user.email || "")
      setAvatar(user.avatar || "/placeholder.svg?height=200&width=200")
    }
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real implementation, this would upload the file to storage
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAvatar = event.target.result as string
          setAvatar(newAvatar)
          if (user?.email) {
            updateUserAvatar(user.email, newAvatar)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectAvatar = (avatarUrl: string) => {
    setAvatar(avatarUrl)
    if (user?.email) {
      updateUserAvatar(user.email, avatarUrl)
    }
    setShowAvatarSelector(false)
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Update username
    if (user?.email && username !== user.name) {
      updateUserName(user.email, username)
    }

    // In a real implementation, this would update the profile in the database
    setTimeout(() => {
      toast({
        title: "Profil güncellendi",
        description: "Profil bilgileriniz başarıyla güncellendi.",
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleDeleteComment = (contentId: number, contentType: "movie" | "tv") => {
    setCommentToDelete({ contentId, contentType })
  }

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      removeComment(commentToDelete.contentId, commentToDelete.contentType)
      setCommentToDelete(null)
      toast({
        title: "Yorum silindi",
        description: "Yorumunuz başarıyla silindi.",
      })
    }
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    // Clear all localStorage data to force re-registration
    localStorage.clear()
    logout()
    toast({
      title: "Oturum kapatıldı",
      description: "Başarıyla çıkış yaptınız.",
    })
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profil</h1>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Oturumu Kapat
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="relative h-40 w-40 overflow-hidden rounded-full">
                  <Image src={avatar || "/placeholder.svg"} alt="Avatar" fill className="object-cover" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="flex items-center"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Avatar Seç
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAvatar("/placeholder.svg?height=200&width=200")
                    if (user?.email) {
                      updateUserAvatar(user.email, "/placeholder.svg?height=200&width=200")
                    }
                    toast({
                      title: "Avatar silindi",
                      description: "Profil fotoğrafınız başarıyla silindi.",
                    })
                  }}
                  className="flex items-center text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Avatar Sil
                </Button>
                <input
                  ref={fileInputRef}
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              {showAvatarSelector && (
                <div className="bg-card p-4 rounded-lg border shadow-md">
                  <h3 className="text-sm font-medium mb-2">Avatar Seç</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {avatarOptions.map((avatarUrl, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer p-1 rounded-full ${
                          avatar === avatarUrl ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => handleSelectAvatar(avatarUrl)}
                      >
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={`Avatar ${index + 1}`} />
                          <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs"
                    >
                      Kendi Fotoğrafını Yükle
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Card>
              <form onSubmit={handleProfileUpdate}>
                <CardHeader>
                  <CardTitle>Profil Bilgileri</CardTitle>
                  <CardDescription>Profil bilgilerinizi güncelleyin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Kullanıcı Adı</Label>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} readOnly />
                    <p className="text-xs text-muted-foreground">
                      E-posta adresinizi değiştirmek için ayarlar sayfasını ziyaret edin.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      "Güncelleniyor..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          <div>
            <Tabs defaultValue="history">
              <TabsList className="mb-6">
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-2" />
                  İzleme Geçmişi
                </TabsTrigger>
                <TabsTrigger value="watchlist">
                  <Bookmark className="h-4 w-4 mr-2" />
                  İzleme Listem
                </TabsTrigger>
                <TabsTrigger value="liked">
                  <Heart className="h-4 w-4 mr-2" />
                  Beğendiklerim
                </TabsTrigger>
                <TabsTrigger value="ratings">
                  <Star className="h-4 w-4 mr-2" />
                  Puanlamalarım
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Yorumlarım
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">İzleme Geçmişi</h2>
                    <Link href="/history">
                      <Button variant="outline" size="sm">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>

                  {user.history && user.history.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {user.history.slice(0, 4).map((item) => (
                        <MovieCard
                          key={`${item.contentType}-${item.contentId}`}
                          movie={{
                            id: item.contentId,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            releaseYear: "",
                            type: item.contentType,
                            rating: "0",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <History className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">Henüz izlediğiniz bir içerik bulunmuyor.</p>
                        <Button className="mt-4" asChild>
                          <Link href="/">İçerik Keşfet</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="watchlist">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">İzleme Listem</h2>
                    <Link href="/watchlist">
                      <Button variant="outline" size="sm">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>

                  {user.watchlist && user.watchlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {user.watchlist.slice(0, 4).map((item) => (
                        <MovieCard
                          key={`${item.contentType}-${item.contentId}`}
                          movie={{
                            id: item.contentId,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            releaseYear: "",
                            type: item.contentType,
                            rating: "0",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">
                          Henüz izleme listenizde bir içerik bulunmuyor.
                        </p>
                        <Button className="mt-4" asChild>
                          <Link href="/">İçerik Keşfet</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="liked">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Beğendiklerim</h2>
                    <Link href="/favorites">
                      <Button variant="outline" size="sm">
                        Tümünü Gör
                      </Button>
                    </Link>
                  </div>

                  {user.likes && user.likes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {user.likes.slice(0, 4).map((item) => (
                        <MovieCard
                          key={`${item.contentType}-${item.contentId}`}
                          movie={{
                            id: item.contentId,
                            title: item.title,
                            posterUrl: item.posterUrl,
                            releaseYear: "",
                            type: item.contentType,
                            rating: "0",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">Henüz beğendiğiniz bir içerik bulunmuyor.</p>
                        <Button className="mt-4" asChild>
                          <Link href="/">İçerik Keşfet</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="ratings">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Puanlamalarım</h2>

                  {user.ratings && user.ratings.length > 0 ? (
                    <div className="space-y-4">
                      {user.ratings.map((rating) => (
                        <Card key={`${rating.contentType}-${rating.contentId}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/${rating.contentType}/${rating.contentId}`}
                                className="font-medium hover:text-primary"
                              >
                                {user.history?.find(
                                  (item) =>
                                    item.contentId === rating.contentId && item.contentType === rating.contentType,
                                )?.title || `${rating.contentType === "movie" ? "Film" : "Dizi"} #${rating.contentId}`}
                              </Link>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-5 w-5 ${
                                        i < rating.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeRating(rating.contentId, rating.contentType)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <Star className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">Henüz puanladığınız bir içerik bulunmuyor.</p>
                        <Button className="mt-4" asChild>
                          <Link href="/">İçerik Keşfet</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="comments">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Yorumlarım</h2>

                  {user.comments && user.comments.length > 0 ? (
                    <div className="space-y-4">
                      {user.comments.map((comment) => (
                        <Card key={`${comment.contentType}-${comment.contentId}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar>
                                <AvatarImage src={avatar || "/placeholder.svg"} alt={username} />
                                <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <Link
                                    href={`/${comment.contentType}/${comment.contentId}`}
                                    className="font-medium hover:text-primary"
                                  >
                                    {comment.title ||
                                      `${comment.contentType === "movie" ? "Film" : "Dizi"} #${comment.contentId}`}
                                  </Link>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(comment.date).toLocaleDateString()}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleDeleteComment(comment.contentId, comment.contentType)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                                <p className="mt-1 text-sm">{comment.text}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-10">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-muted-foreground">Henüz yorum yapmadınız.</p>
                        <Button className="mt-4" asChild>
                          <Link href="/">İçerik Keşfet</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
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

      <AlertDialog open={!!commentToDelete} onOpenChange={() => setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteComment}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Oturumu Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              Oturumu kapatmak istediğinizden emin misiniz? Tekrar giriş yapmak için yeniden kayıt olmanız gerekecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Oturumu Kapat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
