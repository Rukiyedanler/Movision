"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Shield, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MainNav } from "@/components/main-nav"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Güvenlik soruları
const securityQuestions: { [key: string]: string } = {
  pet: "İlk evcil hayvanınızın adı nedir?",
  school: "İlk gittiğiniz okulun adı nedir?",
  city: "Doğduğunuz şehir neresidir?",
  mother: "Annenizin kızlık soyadı nedir?",
  movie: "En sevdiğiniz film nedir?",
}

export default function SettingsPage() {
  const { user, updatePassword, updateUserEmail, verifySecurityAnswer } = useAuth()
  const { toast } = useToast()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [userSecurityQuestion, setUserSecurityQuestion] = useState("")

  useEffect(() => {
    if (user) {
      setUserSecurityQuestion(user.securityQuestion || "")
    }
  }, [user])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Şifre doğrulama kontrolleri
    if (newPassword !== confirmPassword) {
      toast({
        title: "Hata",
        description: "Yeni şifreler eşleşmiyor.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalıdır.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Gerçek uygulamada mevcut şifre doğrulanmalıdır
    // Burada mock bir doğrulama yapıyoruz
    if (currentPassword !== "demo123" && user?.email === "demo@example.com") {
      toast({
        title: "Hata",
        description: "Mevcut şifre yanlış.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      if (user?.email) {
        const success = await updatePassword(user.email, newPassword)
        if (success) {
          toast({
            title: "Başarılı",
            description: "Şifreniz başarıyla güncellendi.",
          })
          // Formu temizle
          setCurrentPassword("")
          setNewPassword("")
          setConfirmPassword("")
        } else {
          toast({
            title: "Hata",
            description: "Şifre güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Şifre güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) return

    if (newEmail === user.email) {
      toast({
        title: "Bilgi",
        description: "Yeni e-posta adresi mevcut adresinizle aynı.",
      })
      return
    }

    // Show security question dialog
    setShowSecurityDialog(true)
  }

  const handleSecurityAnswerSubmit = async () => {
    setIsLoading(true)

    if (!user?.email) return

    try {
      const isCorrect = await verifySecurityAnswer(user.email, securityAnswer)

      if (isCorrect) {
        const success = await updateUserEmail(user.email, newEmail)

        if (success) {
          toast({
            title: "Başarılı",
            description: "E-posta adresiniz başarıyla güncellendi.",
          })
          setNewEmail("")
          setSecurityAnswer("")
          setShowSecurityDialog(false)
        } else {
          toast({
            title: "Hata",
            description: "E-posta güncellenirken bir hata oluştu.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Hata",
          description: "Güvenlik sorusu cevabı yanlış.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "E-posta güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationSettingsChange = () => {
    toast({
      title: "Bildirim Ayarları",
      description: "Bildirim ayarlarınız kaydedildi.",
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Ayarlar</h1>
        </div>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Hesap
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Bildirimler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>E-posta Adresi</CardTitle>
                <CardDescription>E-posta adresinizi güncelleyin.</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-email">Mevcut E-posta</Label>
                    <Input id="current-email" value={user.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Yeni E-posta</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Güncelleniyor..." : "E-posta Güncelle"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
                <CardDescription>Hesabınızın şifresini güncelleyin.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mevcut Şifre</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Yeni Şifre</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Güncelleniyor..." : "Şifre Güncelle"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bildirim Ayarları</CardTitle>
                <CardDescription>Bildirim tercihlerinizi yönetin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">E-posta Bildirimleri</Label>
                    <p className="text-sm text-muted-foreground">Yeni içerikler ve öneriler hakkında e-posta alın.</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Anlık Bildirimler</Label>
                    <p className="text-sm text-muted-foreground">
                      Yeni içerikler ve öneriler hakkında tarayıcı bildirimleri alın.
                    </p>
                  </div>
                  <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleNotificationSettingsChange}>Ayarları Kaydet</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Güvenlik Doğrulaması</DialogTitle>
            <DialogDescription>E-posta adresinizi değiştirmek için güvenlik sorunuzu cevaplayın.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="security-question">
                Güvenlik Sorusu: {securityQuestions[userSecurityQuestion] || "Güvenlik sorusu"}
              </Label>
              <Input
                id="security-answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Cevabınızı girin"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSecurityDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSecurityAnswerSubmit} disabled={isLoading}>
              {isLoading ? "Doğrulanıyor..." : "Doğrula"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
