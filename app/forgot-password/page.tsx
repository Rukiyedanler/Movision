"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Film, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

enum ForgotPasswordStep {
  EMAIL = 0,
  SECURITY_QUESTION = 1,
  RESET_PASSWORD = 2,
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(ForgotPasswordStep.EMAIL)
  const [securityQuestion, setSecurityQuestion] = useState("")

  const { toast } = useToast()
  const { verifySecurityAnswer, getUserByEmail, updatePassword } = useAuth()
  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Kullanıcıyı e-posta adresine göre bul
      const user = getUserByEmail(email)

      if (!user) {
        toast({
          variant: "destructive",
          title: "Kullanıcı bulunamadı",
          description: "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.",
        })
        return
      }

      // Güvenlik sorusunu göster
      const questionMap: { [key: string]: string } = {
        pet: "İlk evcil hayvanınızın adı nedir?",
        school: "İlk gittiğiniz okulun adı nedir?",
        city: "Doğduğunuz şehir neresidir?",
        mother: "Annenizin kızlık soyadı nedir?",
        movie: "En sevdiğiniz film nedir?",
      }

      setSecurityQuestion(questionMap[user.securityQuestion] || "Güvenlik sorusu bulunamadı")
      setCurrentStep(ForgotPasswordStep.SECURITY_QUESTION)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bir hata oluştu",
        description: "Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSecurityAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const isCorrect = await verifySecurityAnswer(email, securityAnswer)

      if (!isCorrect) {
        toast({
          variant: "destructive",
          title: "Yanlış cevap",
          description: "Güvenlik sorusuna verdiğiniz cevap yanlış.",
        })
        return
      }

      setCurrentStep(ForgotPasswordStep.RESET_PASSWORD)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bir hata oluştu",
        description: "Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Şifreler eşleşmiyor",
        description: "Lütfen şifrelerin aynı olduğundan emin olun.",
      })
      return
    }

    setIsLoading(true)

    try {
      const success = await updatePassword(email, newPassword)

      if (success) {
        toast({
          title: "Şifre sıfırlandı",
          description: "Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.",
        })
        router.push("/login")
      } else {
        toast({
          variant: "destructive",
          title: "Şifre sıfırlanamadı",
          description: "Şifreniz sıfırlanırken bir hata oluştu.",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Bir hata oluştu",
        description: "Lütfen daha sonra tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Arka plan resmi */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg"
          alt="Background"
          fill
          className="object-cover brightness-25"
        />
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
          <CardTitle className="text-2xl font-bold text-center">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-center">
            {currentStep === ForgotPasswordStep.EMAIL && "Hesabınıza bağlı e-posta adresinizi girin"}
            {currentStep === ForgotPasswordStep.SECURITY_QUESTION && "Güvenlik sorunuzu cevaplayın"}
            {currentStep === ForgotPasswordStep.RESET_PASSWORD && "Yeni şifrenizi belirleyin"}
          </CardDescription>
        </CardHeader>

        {currentStep === ForgotPasswordStep.EMAIL && (
          <form onSubmit={handleEmailSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "İşleniyor..." : "Devam Et"}
              </Button>
              <div className="text-center text-sm">
                <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:underline flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Giriş sayfasına dön
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {currentStep === ForgotPasswordStep.SECURITY_QUESTION && (
          <form onSubmit={handleSecurityAnswerSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Güvenlik Sorusu</Label>
                <div className="p-3 bg-muted rounded-md">{securityQuestion}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="securityAnswer">Cevabınız</Label>
                <Input
                  id="securityAnswer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Doğrulanıyor..." : "Doğrula"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setCurrentStep(ForgotPasswordStep.EMAIL)}
              >
                Geri Dön
              </Button>
            </CardFooter>
          </form>
        )}

        {currentStep === ForgotPasswordStep.RESET_PASSWORD && (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Yeni Şifre</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Şifre Sıfırlanıyor..." : "Şifremi Sıfırla"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setCurrentStep(ForgotPasswordStep.SECURITY_QUESTION)}
              >
                Geri Dön
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
