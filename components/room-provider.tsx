"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"

interface RoomMember {
  name: string
  email: string
  avatar: string
  joinedAt: string
}

interface SharedContent {
  id: string
  contentId: number
  contentType: "movie" | "tv"
  title: string
  posterUrl: string
  sharedBy: string
  sharedAt: string
}

export interface Room {
  id: string
  code: string
  name: string
  createdBy: string
  createdAt: string
  members: RoomMember[]
  sharedContent: SharedContent[]
}

interface RoomContextType {
  rooms: Room[]
  userRooms: Room[]
  createRoom: (name: string) => string
  joinRoom: (code: string) => boolean
  leaveRoom: (roomId: string) => void
  shareContent: (
    roomId: string,
    contentId: number,
    contentType: "movie" | "tv",
    title: string,
    posterUrl: string,
  ) => void
  getRoom: (roomId: string) => Room | undefined
  getRoomByCode: (code: string) => Room | undefined
}

const RoomContext = createContext<RoomContextType | undefined>(undefined)

export function RoomProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // Load rooms from localStorage on mount
  useEffect(() => {
    const storedRooms = localStorage.getItem("rooms")
    if (storedRooms) {
      try {
        setRooms(JSON.parse(storedRooms))
      } catch (error) {
        console.error("Failed to parse stored rooms:", error)
      }
    }
  }, [])

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem("rooms", JSON.stringify(rooms))
    }
  }, [rooms])

  // Get rooms that the current user is a member of
  const userRooms = rooms.filter(
    (room) => user && (room.createdBy === user.email || room.members.some((member) => member.email === user.email)),
  )

  // Generate a unique room code (6 characters)
  const generateRoomCode = (): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    // Check if code already exists
    const codeExists = rooms.some((room) => room.code === code)
    if (codeExists) {
      return generateRoomCode() // Try again if code already exists
    }

    return code
  }

  // Create a new room
  const createRoom = (name: string): string => {
    if (!user) {
      toast({
        title: "Hata",
        description: "Oda oluşturmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      return ""
    }

    const roomCode = generateRoomCode()
    const roomId = `room_${Date.now()}`

    const newRoom: Room = {
      id: roomId,
      code: roomCode,
      name,
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      members: [
        {
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          joinedAt: new Date().toISOString(),
        },
      ],
      sharedContent: [],
    }

    setRooms((prevRooms) => [...prevRooms, newRoom])

    toast({
      title: "Oda Oluşturuldu",
      description: `"${name}" odası başarıyla oluşturuldu. Oda kodu: ${roomCode}`,
    })

    return roomId
  }

  // Join a room using a code
  const joinRoom = (code: string): boolean => {
    if (!user) {
      toast({
        title: "Hata",
        description: "Odaya katılmak için giriş yapmalısınız.",
        variant: "destructive",
      })
      return false
    }

    const room = rooms.find((r) => r.code === code)
    if (!room) {
      toast({
        title: "Hata",
        description: "Geçersiz oda kodu.",
        variant: "destructive",
      })
      return false
    }

    // Check if user is already a member
    if (room.members.some((member) => member.email === user.email)) {
      toast({
        title: "Bilgi",
        description: "Bu odaya zaten katıldınız.",
      })
      return true
    }

    // Check if room is full (max 10 members)
    if (room.members.length >= 10) {
      toast({
        title: "Hata",
        description: "Bu oda dolu (maksimum 10 kişi).",
        variant: "destructive",
      })
      return false
    }

    // Add user to room members
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === room.id) {
          return {
            ...r,
            members: [
              ...r.members,
              {
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                joinedAt: new Date().toISOString(),
              },
            ],
          }
        }
        return r
      }),
    )

    toast({
      title: "Odaya Katıldınız",
      description: `"${room.name}" odasına başarıyla katıldınız.`,
    })

    return true
  }

  // Leave a room
  const leaveRoom = (roomId: string) => {
    if (!user) return

    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    // If user is the creator, delete the room
    if (room.createdBy === user.email) {
      setRooms((prevRooms) => prevRooms.filter((r) => r.id !== roomId))
      toast({
        title: "Oda Silindi",
        description: `"${room.name}" odası silindi.`,
      })
      return
    }

    // Otherwise, remove user from members
    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            members: r.members.filter((member) => member.email !== user.email),
          }
        }
        return r
      }),
    )

    toast({
      title: "Odadan Ayrıldınız",
      description: `"${room.name}" odasından ayrıldınız.`,
    })
  }

  // Share content in a room
  const shareContent = (
    roomId: string,
    contentId: number,
    contentType: "movie" | "tv",
    title: string,
    posterUrl: string,
  ) => {
    if (!user) return

    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    // Check if user is a member of the room
    if (!room.members.some((member) => member.email === user.email)) {
      toast({
        title: "Hata",
        description: "Bu odada içerik paylaşmak için üye olmalısınız.",
        variant: "destructive",
      })
      return
    }

    // Check if content is already shared
    if (room.sharedContent.some((content) => content.contentId === contentId && content.contentType === contentType)) {
      toast({
        title: "Bilgi",
        description: "Bu içerik zaten bu odada paylaşılmış.",
      })
      return
    }

    const newContent: SharedContent = {
      id: `content_${Date.now()}`,
      contentId,
      contentType,
      title,
      posterUrl,
      sharedBy: user.email,
      sharedAt: new Date().toISOString(),
    }

    setRooms((prevRooms) =>
      prevRooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            sharedContent: [newContent, ...r.sharedContent],
          }
        }
        return r
      }),
    )

    toast({
      title: "İçerik Paylaşıldı",
      description: `"${title}" içeriği "${room.name}" odasında paylaşıldı.`,
    })
  }

  // Get a room by ID
  const getRoom = (roomId: string) => {
    return rooms.find((room) => room.id === roomId)
  }

  // Get a room by code
  const getRoomByCode = (code: string) => {
    return rooms.find((room) => room.code === code)
  }

  return (
    <RoomContext.Provider
      value={{
        rooms,
        userRooms,
        createRoom,
        joinRoom,
        leaveRoom,
        shareContent,
        getRoom,
        getRoomByCode,
      }}
    >
      {children}
    </RoomContext.Provider>
  )
}

export function useRoom() {
  const context = useContext(RoomContext)
  if (context === undefined) {
    throw new Error("useRoom must be used within a RoomProvider")
  }
  return context
}
