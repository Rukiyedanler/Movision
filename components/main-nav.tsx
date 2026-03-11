"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Film, Tv, Globe, X, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NotificationsPopover } from "@/components/notifications-popover"
import { UserMenu } from "@/components/user-menu"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { FilterPopover } from "@/components/filter-popover"
import { searchMulti, formatSearchResult } from "@/lib/tmdb"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MainNav() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { t, language, setLanguage } = useLanguage()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Arama sonuçlarını dışarıda bir yere tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Arama sorgusu değiştiğinde sonuçları getir
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      try {
        const data = await searchMulti(searchQuery)
        const formattedResults = data.results
          .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
          .map((item: any) => formatSearchResult(item))
          .filter(Boolean)
          .slice(0, 5) // Sadece ilk 5 sonucu göster

        setSearchResults(formattedResults)
        setShowResults(formattedResults.length > 0)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    // Use a debounce to avoid too many API calls
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchSearchResults()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Add timestamp to force refresh
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}&t=${Date.now()}`)
      setShowResults(false)

      // Clear the search input after navigation
      setSearchQuery("")
    }
  }

  const handleResultClick = (type: string, id: number) => {
    router.push(`/${type}/${id}?t=${Date.now()}`)
    setShowResults(false)
    setSearchQuery("")
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
    searchInputRef.current?.focus()
  }

  const toggleLanguage = () => {
    setLanguage(language === "tr" ? "en" : "tr")
  }

  return (
    <div
      className={`flex items-center w-full transition-all duration-300 ${isScrolled ? "h-16 search-fixed" : "h-20"}`}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-primary">MOVISION+</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/movies" className="text-sm font-medium hover:text-primary transition-colors">
              <div className="flex items-center gap-1">
                <Film className="h-4 w-4" />
                <span>Filmler</span>
              </div>
            </Link>
            <Link href="/tv-shows" className="text-sm font-medium hover:text-primary transition-colors">
              <div className="flex items-center gap-1">
                <Tv className="h-4 w-4" />
                <span>Diziler</span>
              </div>
            </Link>
            {isLoggedIn && (
              <Link href="/rooms" className="text-sm font-medium hover:text-primary transition-colors">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Odalar</span>
                </div>
              </Link>
            )}
          </nav>
        </div>

        <div className="relative w-full max-w-md mx-auto">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder={t("search.placeholder")}
                className="w-full pl-10 pr-10 h-10 bg-background/80 backdrop-blur border-primary/20 focus-visible:border-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FilterPopover />
          </form>

          {/* Arama Sonuçları */}
          {showResults && searchResults.length > 0 && (
            <Card
              className="absolute top-full left-0 right-0 mt-1 z-50 max-h-[400px] overflow-auto"
              ref={searchResultsRef}
            >
              <CardContent className="p-0">
                {searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3 border-b last:border-b-0"
                    onClick={() => handleResultClick(result.type, result.id)}
                  >
                    <Avatar className="h-10 w-10 rounded-sm">
                      <AvatarImage src={result.posterUrl || "/placeholder.svg"} alt={result.title} />
                      <AvatarFallback className="rounded-sm">{result.title.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{result.type === "movie" ? "Film" : "Dizi"}</span>
                        {result.releaseYear && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{result.releaseYear}</span>
                          </>
                        )}
                        {result.rating && (
                          <>
                            <span className="mx-1">•</span>
                            <span>⭐ {result.rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="relative"
            title={language === "tr" ? "English" : "Türkçe"}
          >
            <Globe className="h-5 w-5" />
          </Button>

          {isLoggedIn && <NotificationsPopover />}

          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t("auth.login")}
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">{t("auth.register")}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
