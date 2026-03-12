"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Users, Share2, Film, Tv, Plus, ArrowLeft } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { useRoom, type Room } from "@/components/room-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  const { isLoggedIn, user } = useAuth()
  const { getRoom, shareContent } = useRoom()
  const router = useRouter()

  const [room, setRoom] = useState<Room | undefined>(undefined)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [contentType, setContentType] = useState<"movie" | "tv">("movie")
  const [contentId, setContentId] = useState("")
  const [contentTitle, setContentTitle] = useState("")
  const [contentPoster, setContentPoster] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch room data
  useEffect(() => {
    const roomData = getRoom(params.id)
    if (!roomData) {
      router.push("/rooms")
      return
    }
    setRoom(roomData)
  }, [params.id, getRoom, router])

  // Check if user is a member of the room
  const isMember = room && user ? room.members.some((member) => member.email === user.email) : false

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center">
            <MainNav />
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-2">Odalara Erişim</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Film ve dizi odalarına erişmek için giriş yapmalısınız.
            </p>
            <Button onClick={() => router.push("/login")}>Giriş Yap</Button>
          </div>
        </main>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center">
            <MainNav />
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-muted/40 animate-pulse mb-4" />
            <div className="h-8 w-48 bg-muted/40 animate-pulse mb-2" />
            <div className="h-4 w-64 bg-muted/40 animate-pulse mb-6" />
          </div>
        </main>
      </div>
    )
  }

  if (!isMember) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center">
            <MainNav />
          </div>
        </header>

        <main className="flex-1 container py-12">
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-2">Erişim Engellendi</h1>
            <p className="text-muted-foreground mb-6 max-w-md">Bu odaya erişmek için oda üyesi olmalısınız.</p>
            <Button onClick={() => router.push("/rooms")}>Odalara Dön</Button>
          </div>
        </main>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleShareContent = async () => {
    if (!contentId || !contentTitle || !contentPoster) return

    setIsLoading(true)

    try {
      shareContent(room.id, Number.parseInt(contentId), contentType, contentTitle, contentPoster)

      setIsShareDialogOpen(false)
      setContentId("")
      setContentTitle("")
      setContentPoster("")
      setContentType("movie")
    } catch (error) {
      console.error("Error sharing content:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "")
    setContentId(value)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4" onClick={() => router.push("/rooms")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Odalara Dön
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{room.name}</h1>
              <p className="text-muted-foreground">
                Oda Kodu:{" "}
                <Badge variant="outline" className="ml-1 font-mono">
                  {room.code}
                </Badge>
              </p>
            </div>
            <Button onClick={() => setIsShareDialogOpen(true)}>
              <Share2 className="mr-2 h-4 w-4" />
              İçerik Paylaş
            </Button>
          </div>
        </div>

        <Tabs defaultValue="content">
          <TabsList className="mb-6">
            <TabsTrigger value="content">Paylaşılan İçerikler</TabsTrigger>
            <TabsTrigger value="members">Üyeler ({room.members.length}/10)</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            {room.sharedContent.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Share2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Henüz içerik paylaşılmadı</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                      Bu odada henüz hiçbir film veya dizi paylaşılmadı.
                    </p>
                    <Button onClick={() => setIsShareDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      İçerik Paylaş
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {room.sharedContent.map((content) => {
                  const sharedBy = room.members.find((member) => member.email === content.sharedBy)

                  return (
                    <Card key={content.id} className="overflow-hidden">
                      <div className="relative aspect-[2/3]">
                        <Image
                          src={content.posterUrl || "/placeholder.svg?height=450&width=300"}
                          alt={content.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary">{content.contentType === "movie" ? "Film" : "Dizi"}</Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <Link
                          href={`/${content.contentType}/${content.contentId}`}
                          className="font-medium hover:underline line-clamp-1"
                        >
                          {content.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={sharedBy?.avatar || "/placeholder.svg"} alt={sharedBy?.name} />
                            <AvatarFallback>{sharedBy?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {sharedBy?.name || "Kullanıcı"}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatDate(content.sharedAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {room.members.map((member) => (
                    <div key={member.email} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {member.email === room.createdBy && <Badge>Oda Sahibi</Badge>}
                      <p className="text-xs text-muted-foreground">Katıldı: {formatDate(member.joinedAt)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Share Content Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İçerik Paylaş</DialogTitle>
            <DialogDescription>Bu odada paylaşmak istediğiniz film veya dizi bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <RadioGroup
              value={contentType}
              onValueChange={(value) => setContentType(value as "movie" | "tv")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="movie" id="movie" />
                <Label htmlFor="movie" className="flex items-center">
                  <Film className="mr-2 h-4 w-4" />
                  Film
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tv" id="tv" />
                <Label htmlFor="tv" className="flex items-center">
                  <Tv className="mr-2 h-4 w-4" />
                  Dizi
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="content-id">İçerik ID</Label>
              <Input
                id="content-id"
                placeholder="TMDB ID (örn: 550)"
                value={contentId}
                onChange={handleContentIdChange}
              />
              <p className="text-xs text-muted-foreground">
                Film veya dizi sayfasındaki URL'den ID'yi alabilirsiniz. Örneğin: /movie/550
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-title">İçerik Başlığı</Label>
              <Input
                id="content-title"
                placeholder="Film veya dizi adı"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content-poster">Poster URL</Label>
              <Input
                id="content-poster"
                placeholder="https://image.tmdb.org/t/p/w500/..."
                value={contentPoster}
                onChange={(e) => setContentPoster(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Film veya dizi posterinin URL'sini girin. TMDB'den alabilirsiniz.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleShareContent} disabled={!contentId || !contentTitle || !contentPoster || isLoading}>
              {isLoading ? "Paylaşılıyor..." : "Paylaş"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
