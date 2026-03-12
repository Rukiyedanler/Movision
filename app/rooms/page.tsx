"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Users, LogIn, X, Share2, LogOut } from "lucide-react"
import { MainNav } from "@/components/main-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"
import { useRoom } from "@/components/room-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function RoomsPage() {
  const { isLoggedIn, user } = useAuth()
  const { userRooms, createRoom, joinRoom, leaveRoom } = useRoom()
  const router = useRouter()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [roomToLeave, setRoomToLeave] = useState<string | null>(null)
  const [isOwnerLeaving, setIsOwnerLeaving] = useState(false)

  const [newRoomName, setNewRoomName] = useState("")
  const [roomCode, setRoomCode] = useState("")

  useEffect(() => {
    if (roomToLeave) {
      const room = userRooms.find((r) => r.id === roomToLeave)
      setIsOwnerLeaving(room?.createdBy === user?.email)
    } else {
      setIsOwnerLeaving(false)
    }
  }, [roomToLeave, userRooms, user?.email])

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return

    const roomId = createRoom(newRoomName.trim())
    setNewRoomName("")
    setIsCreateDialogOpen(false)

    if (roomId) {
      router.push(`/rooms/${roomId}`)
    }
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return

    const success = joinRoom(roomCode.trim())
    setRoomCode("")
    setIsJoinDialogOpen(false)

    if (success) {
      // Refresh the page to show the new room
      router.refresh()
    }
  }

  const confirmLeaveRoom = (roomId: string) => {
    setRoomToLeave(roomId)
    setIsLeaveDialogOpen(true)
  }

  const handleLeaveRoom = () => {
    if (roomToLeave) {
      leaveRoom(roomToLeave)
      setRoomToLeave(null)
      setIsLeaveDialogOpen(false)
    }
  }

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

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center">
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Film ve Dizi Odaları</h1>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Oda Oluştur
            </Button>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Odaya Katıl
            </Button>
          </div>
        </div>

        {userRooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Henüz bir odanız yok</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Yeni bir oda oluşturabilir veya mevcut bir odaya katılabilirsiniz.
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Oda Oluştur
                  </Button>
                  <Button variant="outline" onClick={() => setIsJoinDialogOpen(true)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Odaya Katıl
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{room.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => confirmLeaveRoom(room.id)}
                    >
                      {room.createdBy === user?.email ? <X className="h-4 w-4" /> : <LogOut className="h-4 w-4" />}
                    </Button>
                  </div>
                  <CardDescription>
                    Oda Kodu:{" "}
                    <Badge variant="outline" className="ml-1 font-mono">
                      {room.code}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center gap-1 mb-3 flex-wrap">
                    {room.members.slice(0, 5).map((member, index) => (
                      <Avatar key={index} className="h-8 w-8 border">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {room.members.length > 5 && (
                      <Badge variant="secondary" className="ml-1">
                        +{room.members.length - 5}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{room.sharedContent.length} içerik paylaşıldı</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => router.push(`/rooms/${room.id}`)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Odaya Git
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Create Room Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Oda Oluştur</DialogTitle>
            <DialogDescription>Arkadaşlarınızla film ve dizi paylaşabileceğiniz bir oda oluşturun.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="room-name">Oda Adı</Label>
              <Input
                id="room-name"
                placeholder="Oda adını girin"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreateRoom} disabled={!newRoomName.trim()}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Room Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Odaya Katıl</DialogTitle>
            <DialogDescription>Bir odaya katılmak için oda kodunu girin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="room-code">Oda Kodu</Label>
              <Input
                id="room-code"
                placeholder="6 haneli oda kodunu girin"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="font-mono uppercase"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleJoinRoom} disabled={!roomCode.trim() || roomCode.length !== 6}>
              Katıl
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Room Confirmation */}
      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{roomToLeave && isOwnerLeaving ? "Odayı Sil" : "Odadan Ayrıl"}</AlertDialogTitle>
            <AlertDialogDescription>
              {roomToLeave && isOwnerLeaving
                ? "Bu odayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve tüm paylaşılan içerikler silinecektir."
                : "Bu odadan ayrılmak istediğinizden emin misiniz?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsLeaveDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveRoom}>
              {roomToLeave && isOwnerLeaving ? "Odayı Sil" : "Odadan Ayrıl"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
