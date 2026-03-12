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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"

// Arka plan görselleri
const backgroundImages = [
  "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg", // Dune
  "https://image.tmdb.org/t/p/original/yF1eOkaYvwiORauRCPWznV9xVvi.jpg", // Interstellar
  "https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", // Inception
  "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", // Dark Knight
  "https://image.tmdb.org/t/p/original/uozb2VeD87YmhoUP1RrGWfzuCrr.jpg", // Joker
]

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedKVKK, setAcceptedKVKK] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [showKVKKModal, setShowKVKKModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [currentBgIndex, setCurrentBgIndex] = useState(0)
  const [hasScrolledToBottomKVKK, setHasScrolledToBottomKVKK] = useState(false)
  const [hasScrolledToBottomPrivacy, setHasScrolledToBottomPrivacy] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()
  const { registerUser } = useAuth()

  // Arka plan görselini belirli aralıklarla değiştir
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length)
    }, 8000) // 8 saniyede bir değiştir

    return () => clearInterval(interval)
  }, [])

  const handleKVKKScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Check if scrolled to bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasScrolledToBottomKVKK(true)
    }
  }

  const handlePrivacyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Check if scrolled to bottom (with a small threshold)
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasScrolledToBottomPrivacy(true)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedKVKK || !acceptedPrivacy) {
      toast({
        variant: "destructive",
        title: "Kullanım Koşulları ve Gizlilik Politikası",
        description: "Devam etmek için Kullanım Koşulları ve Gizlilik Politikasını kabul etmelisiniz.",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Şifreler eşleşmiyor",
        description: "Lütfen şifrelerin aynı olduğundan emin olun.",
      })
      return
    }

    setIsLoading(true)

    try {
      // Kullanıcı kaydı
      const userData = {
        name: username,
        email,
        avatar: "/placeholder.svg?height=36&width=36", // Varsayılan avatar
        securityQuestion,
        securityAnswer,
        likes: [],
        watchlist: [],
        watched: [],
        ratings: [],
        comments: [],
        history: [],
        notifications: [
          {
            id: "welcome",
            type: "welcome",
            title: "Hoş Geldiniz!",
            message: `Merhaba ${username}, MOVISION+'a hoş geldiniz! Hemen film ve dizileri keşfetmeye başlayabilirsiniz.`,
            date: new Date().toISOString(),
            read: false,
          },
        ],
      }

      registerUser(userData, password)

      toast({
        title: t("auth.registerSuccess"),
        description: t("auth.registerSuccessDesc"),
      })
      router.push("/login")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kayıt başarısız",
        description: "Bir hata oluştu. Lütfen tekrar deneyin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const acceptKVKK = () => {
    if (hasScrolledToBottomKVKK) {
      setAcceptedKVKK(true)
      setShowKVKKModal(false)
    } else {
      toast({
        variant: "destructive",
        title: "Metni sonuna kadar okuyun",
        description: "Lütfen kullanım koşullarını sonuna kadar okuyun.",
      })
    }
  }

  const acceptPrivacy = () => {
    if (hasScrolledToBottomPrivacy) {
      setAcceptedPrivacy(true)
      setShowPrivacyModal(false)
    } else {
      toast({
        variant: "destructive",
        title: "Metni sonuna kadar okuyun",
        description: "Lütfen gizlilik politikasını sonuna kadar okuyun.",
      })
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
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
          <CardTitle className="text-2xl font-bold text-center">{t("auth.register")}</CardTitle>
          <CardDescription className="text-center">Hesap oluşturarak film ve dizileri keşfedin</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("auth.username")}</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
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
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityQuestion">{t("auth.securityQuestion")}</Label>
              <Select value={securityQuestion} onValueChange={setSecurityQuestion} required>
                <SelectTrigger>
                  <SelectValue placeholder="Güvenlik sorusu seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pet">İlk evcil hayvanınızın adı nedir?</SelectItem>
                  <SelectItem value="school">İlk gittiğiniz okulun adı nedir?</SelectItem>
                  <SelectItem value="city">Doğduğunuz şehir neresidir?</SelectItem>
                  <SelectItem value="mother">Annenizin kızlık soyadı nedir?</SelectItem>
                  <SelectItem value="movie">En sevdiğiniz film nedir?</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="securityAnswer">{t("auth.securityAnswer")}</Label>
              <Input
                id="securityAnswer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="kvkk" checked={acceptedKVKK} onCheckedChange={(checked) => setAcceptedKVKK(!!checked)} />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="kvkk"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Kullanım koşullarını kabul ediyorum
                </label>
                <p className="text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setShowKVKKModal(true)}
                  >
                    Kullanım koşullarını
                  </button>{" "}
                  okudum ve kabul ediyorum.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="privacy"
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(!!checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacy"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gizlilik politikasını kabul ediyorum
                </label>
                <p className="text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    Gizlilik politikasını
                  </button>{" "}
                  okudum ve kabul ediyorum.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading || !acceptedKVKK || !acceptedPrivacy}>
              {isLoading ? "Kayıt yapılıyor..." : t("auth.register")}
            </Button>
            <div className="text-center text-sm">
              {t("auth.alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                {t("auth.login")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Kullanım Koşulları Modal */}
      <Dialog open={showKVKKModal} onOpenChange={setShowKVKKModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Kullanım Koşulları</DialogTitle>
            <DialogDescription>
              Lütfen aşağıdaki metni dikkatlice okuyun ve en aşağıya kadar kaydırın.
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto pr-2 my-4 max-h-[60vh] custom-scrollbar"
            onScroll={handleKVKKScroll}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db transparent",
              overflowY: "scroll",
            }}
          >
            <div className="space-y-6 pr-4 pb-4">
              <div className="space-y-4 text-sm">
                <p className="font-semibold text-base">
                  Bu kullanım koşulları, Movision platformuna erişen her kullanıcı için geçerlidir. Siteyi kullanarak
                  aşağıdaki koşulları kabul etmiş sayılırsınız.
                </p>

                <div>
                  <p className="font-semibold">1. Hizmet Tanımı</p>
                  <p>
                    Movision, kullanıcılarına kişiselleştirilmiş dizi ve film önerileri sunan bir platformdur. Sağlanan
                    içerikler bilgilendirme amaçlıdır.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">2. Kullanım Kuralları</p>
                  <p>Platform yasalara aykırı amaçlarla kullanılamaz.</p>
                  <p>Kullanıcılar, başka kullanıcıların deneyimini olumsuz etkileyecek davranışlardan kaçınmalıdır.</p>
                  <p>İçeriklere yapılan yorumlar ve etkileşimler, genel ahlak ve yasalara uygun olmalıdır.</p>
                  <p>Sistem açıklarını kötüye kullanmak yasaktır.</p>
                </div>

                <div>
                  <p className="font-semibold">3. Hesap Güvenliği</p>
                  <p>
                    Kullanıcı hesabı oluşturulması halinde, hesap bilgilerinin güvenliğinden kullanıcı sorumludur.
                    Başkasına ait bilgilerle kayıt yapılması yasaktır.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">4. Sorumluluk Reddi</p>
                  <p>
                    Movision, önerilen içeriklerin doğruluğu, erişilebilirliği veya kullanıcıda yaratacağı etki
                    konusunda garanti vermez. İçeriklerin sorumluluğu tamamen ilgili platformlara (örn. Netflix, BluTV
                    vb.) aittir.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">5. Değişiklik Hakkı</p>
                  <p>
                    Movision, bu kullanım koşullarını ve gizlilik politikasını dilediği zaman güncelleme hakkını saklı
                    tutar. Güncellemeler yayınlandığı anda yürürlüğe girer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowKVKKModal(false)}>
              Kapat
            </Button>
            <Button onClick={acceptKVKK} disabled={!hasScrolledToBottomKVKK}>
              {hasScrolledToBottomKVKK ? "Kabul Ediyorum" : "Metni sonuna kadar okuyun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gizlilik Politikası Modal */}
      <Dialog open={showPrivacyModal} onOpenChange={setShowPrivacyModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Gizlilik Politikası</DialogTitle>
            <DialogDescription>
              Lütfen aşağıdaki metni dikkatlice okuyun ve en aşağıya kadar kaydırın.
            </DialogDescription>
          </DialogHeader>

          <div
            className="flex-1 overflow-y-auto pr-2 my-4 max-h-[60vh] custom-scrollbar"
            onScroll={handlePrivacyScroll}
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#d1d5db transparent",
              overflowY: "scroll",
            }}
          >
            <div className="space-y-6 pr-4 pb-4">
              <div className="space-y-4 text-sm">
                <p className="font-semibold text-base">
                  Movision, kullanıcılarının gizliliğine önem verir. Bu gizlilik politikası, platformu kullanırken
                  kişisel verilerinizin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.
                </p>

                <div>
                  <p className="font-semibold">1. Toplanan Veriler</p>
                  <p>Movision aşağıdaki verileri toplayabilir:</p>
                  <p>Kayıt sırasında verilen kullanıcı adı ve (varsa) e-posta adresi</p>
                  <p>IP adresi, tarayıcı bilgisi, cihaz bilgisi</p>
                  <p>Platform içindeki tercih ve kullanım geçmişi (izlediğiniz içerikler, öneriler vb.)</p>
                  <p>Çerezler (cookie) yoluyla elde edilen oturum verileri</p>
                </div>

                <div>
                  <p className="font-semibold">2. Verilerin Kullanım Amaçları</p>
                  <p>Toplanan veriler şu amaçlarla kullanılabilir:</p>
                  <p>Kişiselleştirilmiş öneriler sunmak</p>
                  <p>Kullanıcı deneyimini geliştirmek</p>
                  <p>Teknik altyapıyı korumak ve geliştirmek</p>
                  <p>İstatistiksel analizler yapmak</p>
                </div>

                <div>
                  <p className="font-semibold">3. Verilerin Paylaşımı</p>
                  <p>
                    Kişisel verileriniz üçüncü şahıslarla satılmaz. Ancak barındırma, analiz ve teknik destek gibi
                    hizmetler için iş birliği yapılan teknoloji firmalarıyla yasal sınırlar dahilinde paylaşılabilir.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">4. Çerezler (Cookies)</p>
                  <p>
                    Movision, kullanıcı deneyimini artırmak ve istatistiksel analizler yapmak için çerezlerden
                    faydalanır. Tarayıcınız üzerinden çerezleri devre dışı bırakabilir veya silebilirsiniz.
                  </p>
                </div>

                <div>
                  <p className="font-semibold">5. Veri Güvenliği</p>
                  <p>
                    Verileriniz, yetkisiz erişimlere karşı korunmak amacıyla gerekli teknik ve idari önlemlerle güvence
                    altına alınmaktadır.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPrivacyModal(false)}>
              Kapat
            </Button>
            <Button onClick={acceptPrivacy} disabled={!hasScrolledToBottomPrivacy}>
              {hasScrolledToBottomPrivacy ? "Kabul Ediyorum" : "Metni sonuna kadar okuyun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 20px;
          border: 2px solid transparent;
        }
      `}</style>
    </div>
  )
}
