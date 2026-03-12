"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/components/language-provider"

// Arka plan görselleri
const backgroundImages = [
  "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", // Dune
  "https://image.tmdb.org/t/p/original/yF1eOkaYvwiORauRCPWznV9xVvi.jpg", // Interstellar
  "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", // Inception
  "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", // Dark Knight
  "https://image.tmdb.org/t/p/original/uozb2VeD87YmhoUP1RrGWfzuCrr.jpg", // Joker
]

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const { t } = useLanguage()
  const [error, setError] = useState("")

  // Arka plan görselini belirli aralıklarla değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 8000) // 8 saniyede bir değiştir

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Get user by email
      const usersJson = localStorage.getItem("users")
      const users = usersJson ? JSON.parse(usersJson) : {}
      const getUserByEmail = (email: string) => {
        return users[email]
      }
      const userData = getUserByEmail(email)

      if (!userData) {
        setError("Kullanıcı bulunamadı. Lütfen e-posta adresinizi kontrol edin.")
        setIsLoading(false)
        return
      }

      // Check if password matches (in a real app, this would be done securely on the server)
      const userRecord = users[email]
      if (!userRecord || userRecord.password !== password) {
        setError("Hatalı şifre. Lütfen şifrenizi kontrol edin.")
        setIsLoading(false)
        return
      }

      // Login successful
      login(userData.user)
      router.push("/")
      toast({
        title: "Giriş başarılı",
        description: "Hoş geldiniz, " + userData.user.name,
      })
    } catch (error) {
      console.error("Login error:", error)
      setError("Giriş yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Arka plan resmi */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDuration: "2000ms" }}
          >
            <Image src={image || "/placeholder.svg"} alt="Background" fill className="object-cover brightness-25" />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center space-x-2">
              <Film className="h-6 w-6" />
              <span className="font-bold text-xl">MOVISION+</span>
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">{t("auth.login")}</CardTitle>
          <CardDescription className="text-center">Hesabınıza giriş yaparak film ve dizileri keşfedin</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Giriş yapılıyor..." : t("auth.login")}
            </Button>
            <div className="text-center text-sm">
              {t("auth.dontHaveAccount")}{" "}
              <Link href="/register" className="text-primary underline-offset-4 hover:underline">
                {t("auth.register")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
