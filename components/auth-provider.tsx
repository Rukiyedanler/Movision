"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface UserRating {
  contentId: number
  contentType: "movie" | "tv"
  rating: number
}

interface UserActivity {
  contentId: number
  contentType: "movie" | "tv"
  title: string
  posterUrl: string
  date: string
}

interface UserNotification {
  id: string
  type: string
  title: string
  message: string
  date: string
  read: boolean
}

interface User {
  name: string
  email: string
  avatar: string
  securityQuestion: string
  securityAnswer: string
  likes: UserActivity[]
  watchlist: UserActivity[]
  watched: UserActivity[]
  ratings: UserRating[]
  comments: {
    contentId: number
    contentType: "movie" | "tv"
    title: string
    text: string
    date: string
  }[]
  history: UserActivity[]
  notifications: UserNotification[]
}

interface AuthContextType {
  isLoggedIn: boolean
  login: (userData?: User) => void
  logout: () => void
  user: User | null
  checkAuth: () => boolean
  registerUser: (userData: User, password: string) => void
  verifySecurityAnswer: (email: string, answer: string) => Promise<boolean>
  getUserByEmail: (email: string) => User | null
  updatePassword: (email: string, newPassword: string) => Promise<boolean>
  updateUserAvatar: (email: string, avatar: string) => void
  updateUserName: (email: string, name: string) => void
  updateUserEmail: (oldEmail: string, newEmail: string) => Promise<boolean>
  addToLikes: (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => void
  removeFromLikes: (contentId: number, contentType: "movie" | "tv") => void
  addToWatchlist: (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => void
  removeFromWatchlist: (contentId: number, contentType: "movie" | "tv") => void
  addToWatched: (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => void
  removeFromWatched: (contentId: number, contentType: "movie" | "tv") => void
  addRating: (contentId: number, contentType: "movie" | "tv", rating: number) => void
  removeRating: (contentId: number, contentType: "movie" | "tv") => void
  getRating: (contentId: number, contentType: "movie" | "tv") => number
  addComment: (contentId: number, contentType: "movie" | "tv", title: string, text: string) => void
  removeComment: (contentId: number, contentType: "movie" | "tv") => void
  addToHistory: (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => void
  removeFromHistory: (contentId: number, contentType: "movie" | "tv") => void
  isLiked: (contentId: number, contentType: "movie" | "tv") => boolean
  isInWatchlist: (contentId: number, contentType: "movie" | "tv") => boolean
  isWatched: (contentId: number, contentType: "movie" | "tv") => boolean
  getAllRatings: (contentId: number, contentType: "movie" | "tv") => number[]
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  updateUserData: (updatedUser: User) => void
  deleteNotification: (notificationId: string) => void
  deleteAllNotifications: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Giriş gerektiren sayfalar
const protectedRoutes = ["/profile", "/settings", "/watchlist", "/favorites", "/history", "/notifications", "/rooms"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Kayıtlı kullanıcılar için mock veritabanı
  const [users, setUsers] = useState<{ [email: string]: { user: User; password: string } }>({
    "demo@example.com": {
      user: {
        name: "Demo Kullanıcı",
        email: "demo@example.com",
        avatar: "/placeholder.svg?height=36&width=36",
        securityQuestion: "pet",
        securityAnswer: "karabaş",
        likes: [],
        watchlist: [],
        watched: [],
        ratings: [],
        comments: [],
        history: [],
        notifications: [
          {
            id: "1",
            type: "new_season",
            title: "Stranger Things",
            message: "Stranger Things'in 5. sezonu yayınlandı!",
            date: "2 saat önce",
            read: false,
          },
          {
            id: "2",
            type: "release",
            title: "Dune: Part Two",
            message: "İzlemek istediğiniz Dune: Part Two vizyona girdi!",
            date: "1 gün önce",
            read: false,
          },
        ],
      },
      password: "demo123",
    },
  })

  // Sayfa yüklendiğinde localStorage'dan giriş durumunu kontrol et
  useEffect(() => {
    const storedLoginState = localStorage.getItem("isLoggedIn")
    if (storedLoginState === "true") {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
          setIsLoggedIn(true)
        } catch (error) {
          console.error("Failed to parse stored user data:", error)
          localStorage.removeItem("user")
          localStorage.setItem("isLoggedIn", "false")
        }
      }
    }

    // Kayıtlı kullanıcıları localStorage'dan yükle
    const storedUsers = localStorage.getItem("users")
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error("Failed to parse stored users data:", error)
      }
    } else {
      // İlk kullanımda demo kullanıcısını localStorage'a kaydet
      localStorage.setItem("users", JSON.stringify(users))
    }
  }, [])

  // Korumalı sayfalara erişim kontrolü
  useEffect(() => {
    if (pathname && protectedRoutes.some((route) => pathname.startsWith(route)) && !isLoggedIn) {
      toast({
        title: "Erişim engellendi",
        description: "Bu sayfayı görüntülemek için giriş yapmalısınız.",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [pathname, isLoggedIn, router, toast])

  // Kullanıcı verilerini güncelle
  const updateUserData = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    // Kullanıcılar listesini de güncelle
    if (updatedUser.email) {
      const updatedUsers = {
        ...users,
        [updatedUser.email]: {
          ...users[updatedUser.email],
          user: updatedUser,
        },
      }
      setUsers(updatedUsers)
      localStorage.setItem("users", JSON.stringify(updatedUsers))
    }
  }

  const login = (userData?: User) => {
    if (userData) {
      setUser(userData)
      setIsLoggedIn(true)
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem("user", JSON.stringify(userData))
    }
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.setItem("isLoggedIn", "false")
    localStorage.removeItem("user")
    // Clear all localStorage data related to the user
    localStorage.removeItem("rooms")
    router.push("/")
  }

  const checkAuth = () => {
    return isLoggedIn
  }

  const registerUser = (userData: User, password: string) => {
    // Add welcome notification
    const welcomeNotification: UserNotification = {
      id: `welcome_${Date.now()}`,
      type: "welcome",
      title: "Hoş Geldiniz!",
      message: `Merhaba ${userData.name}, MOVISION+'a hoş geldiniz! Film ve dizi dünyasını keşfetmeye başlayabilirsiniz.`,
      date: new Date().toISOString(),
      read: false,
    }

    const userWithNotification = {
      ...userData,
      notifications: [welcomeNotification, ...userData.notifications],
    }

    // Kullanıcıyı kaydet
    const newUsers = {
      ...users,
      [userData.email]: {
        user: userWithNotification,
        password,
      },
    }

    setUsers(newUsers)
    localStorage.setItem("users", JSON.stringify(newUsers))
  }

  const getUserByEmail = (email: string): User | null => {
    const userRecord = users[email]
    return userRecord ? userRecord.user : null
  }

  const verifySecurityAnswer = async (email: string, answer: string): Promise<boolean> => {
    const userRecord = users[email]
    if (!userRecord) return false

    // Güvenlik sorusu cevabını kontrol et (gerçek uygulamada bu işlem sunucuda yapılmalıdır)
    return userRecord.user.securityAnswer.toLowerCase() === answer.toLowerCase()
  }

  const updatePassword = async (email: string, newPassword: string): Promise<boolean> => {
    const userRecord = users[email]
    if (!userRecord) return false

    // Şifreyi güncelle
    const updatedUsers = {
      ...users,
      [email]: {
        ...userRecord,
        password: newPassword,
      },
    }

    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    return true
  }

  const updateUserAvatar = (email: string, avatar: string) => {
    setUsers((prevUsers) => {
      const updatedUsers = { ...prevUsers }
      if (updatedUsers[email]) {
        updatedUsers[email] = { ...updatedUsers[email], user: { ...updatedUsers[email].user, avatar } }
      }
      return updatedUsers
    })

    // If the current user's email matches, update the current user as well
    if (user && user.email === email) {
      setUser((prevUser) => {
        if (prevUser) {
          return { ...prevUser, avatar }
        }
        return prevUser
      })
    }
  }

  const updateUserName = (email: string, name: string) => {
    if (!user || user.email !== email) return

    const updatedUser = {
      ...user,
      name,
    }

    updateUserData(updatedUser)
  }

  const updateUserEmail = async (oldEmail: string, newEmail: string): Promise<boolean> => {
    if (!user || user.email !== oldEmail) return false

    // Check if new email already exists
    if (users[newEmail]) {
      toast({
        title: "Hata",
        description: "Bu e-posta adresi zaten kullanılıyor.",
        variant: "destructive",
      })
      return false
    }

    // Create a copy of the user record with the new email
    const userRecord = users[oldEmail]
    const updatedUser = {
      ...user,
      email: newEmail,
    }

    // Update users object
    const updatedUsers = {
      ...users,
      [newEmail]: {
        ...userRecord,
        user: updatedUser,
      },
    }

    // Remove the old email entry
    delete updatedUsers[oldEmail]

    // Update state and localStorage
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))

    // Update current user
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    return true
  }

  // Beğeni işlemleri
  const addToLikes = (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => {
    if (!user) return

    // Eğer zaten beğenilmişse, ekleme
    if (isLiked(contentId, contentType)) return

    const newLike: UserActivity = {
      contentId,
      contentType,
      title,
      posterUrl,
      date: new Date().toISOString(),
    }

    const updatedUser = {
      ...user,
      likes: [newLike, ...user.likes],
    }

    updateUserData(updatedUser)
  }

  const removeFromLikes = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      likes: user.likes.filter((item) => !(item.contentId === contentId && item.contentType === contentType)),
    }

    updateUserData(updatedUser)
  }

  // İzleme listesi işlemleri
  const addToWatchlist = (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => {
    if (!user) return

    // Eğer zaten listedeyse, ekleme
    if (isInWatchlist(contentId, contentType)) return

    const newItem: UserActivity = {
      contentId,
      contentType,
      title,
      posterUrl,
      date: new Date().toISOString(),
    }

    const updatedUser = {
      ...user,
      watchlist: [newItem, ...user.watchlist],
    }

    updateUserData(updatedUser)
  }

  const removeFromWatchlist = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      watchlist: user.watchlist.filter((item) => !(item.contentId === contentId && item.contentType === contentType)),
    }

    updateUserData(updatedUser)
  }

  // İzlendi işlemleri
  const addToWatched = (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => {
    if (!user) return

    // Eğer zaten izlendiyse, ekleme
    if (isWatched(contentId, contentType)) return

    const newItem: UserActivity = {
      contentId,
      contentType,
      title,
      posterUrl,
      date: new Date().toISOString(),
    }

    const updatedUser = {
      ...user,
      watched: [newItem, ...user.watched],
    }

    // İzleme geçmişine de ekle
    addToHistory(contentId, contentType, title, posterUrl)

    updateUserData(updatedUser)
  }

  const removeFromWatched = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      watched: user.watched.filter((item) => !(item.contentId === contentId && item.contentType === contentType)),
    }

    updateUserData(updatedUser)
  }

  // Puanlama işlemleri
  const addRating = (contentId: number, contentType: "movie" | "tv", rating: number) => {
    if (!user) return

    // Mevcut puanlamayı kontrol et
    const existingRatingIndex = user.ratings.findIndex(
      (r) => r.contentId === contentId && r.contentType === contentType,
    )

    let updatedRatings
    if (existingRatingIndex >= 0) {
      // Mevcut puanlamayı güncelle
      updatedRatings = [...user.ratings]
      updatedRatings[existingRatingIndex] = { contentId, contentType, rating }
    } else {
      // Yeni puanlama ekle
      updatedRatings = [...user.ratings, { contentId, contentType, rating }]
    }

    const updatedUser = {
      ...user,
      ratings: updatedRatings,
    }

    updateUserData(updatedUser)
  }

  const removeRating = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      ratings: user.ratings.filter((r) => !(r.contentId === contentId && r.contentType === contentType)),
    }

    updateUserData(updatedUser)
  }

  const getRating = (contentId: number, contentType: "movie" | "tv"): number => {
    if (!user) return 0

    const rating = user.ratings.find((r) => r.contentId === contentId && r.contentType === contentType)

    return rating ? rating.rating : 0
  }

  // Tüm kullanıcıların puanlamalarını getir
  const getAllRatings = (contentId: number, contentType: "movie" | "tv"): number[] => {
    const allRatings: number[] = []

    Object.values(users).forEach(({ user }) => {
      const rating = user.ratings.find((r) => r.contentId === contentId && r.contentType === contentType)

      if (rating) {
        allRatings.push(rating.rating)
      }
    })

    return allRatings
  }

  // Yorum işlemleri
  const addComment = (contentId: number, contentType: "movie" | "tv", title: string, text: string) => {
    if (!user) return

    // Check if a comment already exists for this content
    const existingCommentIndex = user.comments.findIndex(
      (c) => c.contentId === contentId && c.contentType === contentType,
    )

    let updatedComments
    if (existingCommentIndex >= 0) {
      // Update existing comment
      updatedComments = [...user.comments]
      updatedComments[existingCommentIndex] = {
        contentId,
        contentType,
        title,
        text,
        date: new Date().toISOString(),
      }
    } else {
      // Add new comment
      updatedComments = [
        {
          contentId,
          contentType,
          title,
          text,
          date: new Date().toISOString(),
        },
        ...user.comments,
      ]
    }

    const updatedUser = {
      ...user,
      comments: updatedComments,
    }

    updateUserData(updatedUser)
  }

  const removeComment = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      comments: user.comments.filter(
        (comment) => !(comment.contentId === contentId && comment.contentType === contentType),
      ),
    }

    updateUserData(updatedUser)
  }

  // İzleme geçmişi işlemleri
  const addToHistory = (contentId: number, contentType: "movie" | "tv", title: string, posterUrl: string) => {
    if (!user) return

    // Önce mevcut geçmişten kaldır (eğer varsa)
    const filteredHistory = user.history.filter(
      (item) => !(item.contentId === contentId && item.contentType === contentType),
    )

    // Sonra en başa ekle
    const newItem: UserActivity = {
      contentId,
      contentType,
      title,
      posterUrl,
      date: new Date().toISOString(),
    }

    const updatedUser = {
      ...user,
      history: [newItem, ...filteredHistory],
    }

    updateUserData(updatedUser)
  }

  const removeFromHistory = (contentId: number, contentType: "movie" | "tv") => {
    if (!user) return

    const updatedUser = {
      ...user,
      history: user.history.filter((item) => !(item.contentId === contentId && item.contentType === contentType)),
    }

    updateUserData(updatedUser)
  }

  // Durum kontrol fonksiyonları
  const isLiked = (contentId: number, contentType: "movie" | "tv"): boolean => {
    if (!user) return false
    return user.likes.some((item) => item.contentId === contentId && item.contentType === contentType)
  }

  const isInWatchlist = (contentId: number, contentType: "movie" | "tv"): boolean => {
    if (!user) return false
    return user.watchlist.some((item) => item.contentId === contentId && item.contentType === contentType)
  }

  const isWatched = (contentId: number, contentType: "movie" | "tv"): boolean => {
    if (!user) return false
    return user.watched.some((item) => item.contentId === contentId && item.contentType === contentType)
  }

  // Bildirim işlemleri
  const markNotificationAsRead = (notificationId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        notifications: user.notifications.map((notification) => {
          if (notification.id === notificationId) {
            return { ...notification, read: true }
          }
          return notification
        }),
      }

      updateUserData(updatedUser)
    }
  }

  const markAllNotificationsAsRead = () => {
    if (user) {
      const updatedUser = {
        ...user,
        notifications: user.notifications.map((notification) => {
          return { ...notification, read: true }
        }),
      }

      updateUserData(updatedUser)
    }
  }

  // Delete a notification
  const deleteNotification = (notificationId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        notifications: user.notifications.filter((notification) => notification.id !== notificationId),
      }

      updateUserData(updatedUser)
    }
  }

  // Delete all notifications
  const deleteAllNotifications = () => {
    if (user) {
      const updatedUser = {
        ...user,
        notifications: [],
      }

      updateUserData(updatedUser)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        user,
        checkAuth,
        registerUser,
        verifySecurityAnswer,
        getUserByEmail,
        updatePassword,
        updateUserAvatar,
        updateUserName,
        updateUserEmail,
        addToLikes,
        removeFromLikes,
        addToWatchlist,
        removeFromWatchlist,
        addToWatched,
        removeFromWatched,
        addRating,
        removeRating,
        getRating,
        addComment,
        removeComment,
        addToHistory,
        removeFromHistory,
        isLiked,
        isInWatchlist,
        isWatched,
        getAllRatings,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        updateUserData,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
