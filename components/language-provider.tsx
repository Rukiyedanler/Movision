"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "tr" | "en"

type Translations = {
  [key: string]: {
    tr: string
    en: string
  }
}

// Temel çeviriler
const translations: Translations = {
  // Genel
  "app.name": {
    tr: "MOVISION+",
    en: "MOVISION+",
  },
  "app.tagline": {
    tr: "Film & Dizi Keşfet",
    en: "Discover Movies & TV Shows",
  },

  // Ana menü
  "menu.home": {
    tr: "Ana Sayfa",
    en: "Home",
  },
  "menu.movies": {
    tr: "Filmler",
    en: "Movies",
  },
  "menu.tvshows": {
    tr: "Diziler",
    en: "TV Shows",
  },
  "menu.discover": {
    tr: "Keşfet",
    en: "Discover",
  },

  // Kullanıcı menüsü
  "menu.mylibrary": {
    tr: "Kütüphanem",
    en: "My Library",
  },
  "menu.watchlist": {
    tr: "İzleme Listem",
    en: "Watchlist",
  },
  "menu.favorites": {
    tr: "Beğendiklerim",
    en: "Favorites",
  },
  "menu.watched": {
    tr: "İzlediklerim",
    en: "Watched",
  },
  "menu.history": {
    tr: "İzleme Geçmişi",
    en: "Watch History",
  },

  // Profil
  "profile.profile": {
    tr: "Profil",
    en: "Profile",
  },
  "profile.settings": {
    tr: "Ayarlar",
    en: "Settings",
  },
  "profile.logout": {
    tr: "Çıkış Yap",
    en: "Logout",
  },

  // Arama
  "search.placeholder": {
    tr: "Film veya dizi ara...",
    en: "Search for movies or TV shows...",
  },
  "search.button": {
    tr: "Ara",
    en: "Search",
  },

  // Ana sayfa
  "home.hero.title": {
    tr: "Keşfedin, İzleyin, Paylaşın",
    en: "Discover, Watch, Share",
  },
  "home.hero.subtitle": {
    tr: "En iyi film ve dizileri keşfedin, izleme listenize ekleyin ve arkadaşlarınızla paylaşın",
    en: "Discover the best movies and TV shows, add them to your watchlist and share with friends",
  },
  "home.trendingMovies": {
    tr: "Trend Filmler",
    en: "Trending Movies",
  },
  "home.trendingTvShows": {
    tr: "Trend Diziler",
    en: "Trending TV Shows",
  },
  "home.upcomingMovies": {
    tr: "Vizyona Girecek Filmler",
    en: "Upcoming Movies",
  },
  "home.popularTrailers": {
    tr: "Popüler Fragmanlar",
    en: "Popular Trailers",
  },
  "home.viewall": {
    tr: "Tümünü Gör",
    en: "View All",
  },

  // Bildirimler
  "notifications.title": {
    tr: "Bildirimler",
    en: "Notifications",
  },
  "notifications.markAllRead": {
    tr: "Tümünü Okundu İşaretle",
    en: "Mark All as Read",
  },
  "notifications.empty": {
    tr: "Bildiriminiz Yok",
    en: "No Notifications",
  },
  "notifications.emptyDesc": {
    tr: "Yeni bildirimler geldiğinde burada görünecek.",
    en: "New notifications will appear here.",
  },

  // Ayarlar
  "settings.theme": {
    tr: "Tema",
    en: "Theme",
  },
  "settings.theme.light": {
    tr: "Açık",
    en: "Light",
  },
  "settings.theme.dark": {
    tr: "Koyu",
    en: "Dark",
  },
  "settings.language": {
    tr: "Dil",
    en: "Language",
  },

  // Giriş/Kayıt
  "auth.login": {
    tr: "Giriş Yap",
    en: "Login",
  },
  "auth.register": {
    tr: "Kayıt Ol",
    en: "Register",
  },
  "auth.email": {
    tr: "E-posta",
    en: "Email",
  },
  "auth.password": {
    tr: "Şifre",
    en: "Password",
  },
  "auth.forgotPassword": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
  },
  "auth.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
  },
  "auth.confirmPassword": {
    tr: "Şifre Tekrar",
    en: "Confirm Password",
  },
  "auth.securityQuestion": {
    tr: "Güvenlik Sorusu",
    en: "Security Question",
  },
  "auth.securityAnswer": {
    tr: "Güvenlik Sorusu Cevabı",
    en: "Security Question Answer",
  },
  "auth.termsAndConditions": {
    tr: "KVKK ve Aydınlatma Metni",
    en: "Terms and Conditions",
  },
  "auth.acceptTerms": {
    tr: "KVKK ve Aydınlatma Metnini kabul ediyorum",
    en: "I accept the Terms and Conditions",
  },
  "auth.alreadyHaveAccount": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
  },
  "auth.dontHaveAccount": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
  },
  "auth.registerSuccess": {
    tr: "Kayıt başarılı",
    en: "Registration successful",
  },
  "auth.registerSuccessDesc": {
    tr: "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.",
    en: "Your account has been created. You can now log in.",
  },
  "auth.loginSuccess": {
    tr: "Giriş başarılı",
    en: "Login successful",
  },
  "auth.loginSuccessDesc": {
    tr: "Hoş geldiniz!",
    en: "Welcome!",
  },

  // Film detayları
  "movie.back": {
    tr: "Geri",
    en: "Back",
  },
  "movie.watchTrailer": {
    tr: "Fragmanı İzle",
    en: "Watch Trailer",
  },
  "movie.about": {
    tr: "Hakkında",
    en: "About",
  },
  "movie.cast": {
    tr: "Oyuncular",
    en: "Cast",
  },
  "movie.comments": {
    tr: "Yorumlar",
    en: "Comments",
  },
  "movie.summary": {
    tr: "Özet",
    en: "Summary",
  },
  "movie.details": {
    tr: "Detaylar",
    en: "Details",
  },
  "movie.director": {
    tr: "Yönetmen",
    en: "Director",
  },
  "movie.studio": {
    tr: "Yapım Şirketi",
    en: "Studio",
  },
  "movie.releaseYear": {
    tr: "Çıkış Yılı",
    en: "Release Year",
  },
  "movie.duration": {
    tr: "Süre",
    en: "Duration",
  },
  "movie.watched": {
    tr: "İzledim",
    en: "Watched",
  },
  "movie.watchlist": {
    tr: "İzleme Listeme Ekle",
    en: "Add to Watchlist",
  },
  "movie.yourRating": {
    tr: "Puanınız",
    en: "Your Rating",
  },
  "movie.imdbRating": {
    tr: "IMDb Puanı",
    en: "IMDb Rating",
  },

  // Yorumlar
  "comments.write": {
    tr: "Yorumunuzu yazın...",
    en: "Write your comment...",
  },
  "comments.submit": {
    tr: "Yorum Yap",
    en: "Comment",
  },
  "comments.loginRequired": {
    tr: "Yorum yapmak için giriş yapmalısınız.",
    en: "You need to login to comment.",
  },
  "comments.empty": {
    tr: "Henüz yorum yapılmamış. İlk yorumu siz yapın!",
    en: "No comments yet. Be the first to comment!",
  },

  // Footer
  "footer.rights": {
    tr: "Tüm hakları saklıdır.",
    en: "All rights reserved.",
  },

  // KVKK
  "kvkk.title": {
    tr: "KVKK ve Aydınlatma Metni",
    en: "Terms and Conditions",
  },
  "kvkk.accept": {
    tr: "Kabul Ediyorum",
    en: "I Accept",
  },
  "kvkk.decline": {
    tr: "Reddet",
    en: "Decline",
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr")

  // Tarayıcı dilini kontrol et
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      const browserLang = navigator.language.split("-")[0]
      if (browserLang === "en") {
        setLanguage("en")
      }
    }
  }, [])

  // Dil değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.lang = language
  }, [language])

  // Çeviri fonksiyonu
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    return translations[key][language]
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
