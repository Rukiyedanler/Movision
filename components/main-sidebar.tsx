"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Home, Clapperboard, Tv, Heart, Clock, Eye, User, Settings, LogOut, History } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/components/language-provider"

export function MainSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const { t } = useLanguage()

  const handleLogout = () => {
    toast({
      title: t("profile.logout"),
      description: "Başarıyla çıkış yaptınız.",
    })
  }

  // Check if user is logged in (in a real app)
  const isLoggedIn = true // This would be determined by auth state
  const username = "kullanici123"
  const avatarUrl = "/placeholder.svg?height=40&width=40"

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-primary">Movision</span>
          </Link>
          <div className="ml-auto">
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("menu.discover")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"} tooltip={t("menu.home")}>
                  <Link href="/">
                    <Home className="mr-2" />
                    <span>{t("menu.home")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/movies"} tooltip={t("menu.movies")}>
                  <Link href="/movies">
                    <Clapperboard className="mr-2" />
                    <span>{t("menu.movies")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/tv-shows"} tooltip={t("menu.tvshows")}>
                  <Link href="/tv-shows">
                    <Tv className="mr-2" />
                    <span>{t("menu.tvshows")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {isLoggedIn ? (
          <SidebarGroup>
            <SidebarGroupLabel>{t("menu.mylibrary")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/watchlist"} tooltip={t("menu.watchlist")}>
                    <Link href="/watchlist">
                      <Clock className="mr-2" />
                      <span>{t("menu.watchlist")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/favorites"} tooltip={t("menu.favorites")}>
                    <Link href="/favorites">
                      <Heart className="mr-2" />
                      <span>{t("menu.favorites")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/watched"} tooltip={t("menu.watched")}>
                    <Link href="/watched">
                      <Eye className="mr-2" />
                      <span>{t("menu.watched")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/history"} tooltip={t("menu.history")}>
                    <Link href="/history">
                      <History className="mr-2" />
                      <span>{t("menu.history")}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground mb-3">Kişisel listeleri görmek için giriş yapın</p>
                <Link href="/login">
                  <Button className="w-full" size="sm">
                    {t("auth.login")}
                  </Button>
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {isLoggedIn ? (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/profile"} tooltip={t("profile.profile")}>
                <Link href="/profile">
                  <User className="mr-2" />
                  <span>{t("profile.profile")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/settings"} tooltip={t("profile.settings")}>
                <Link href="/settings">
                  <Settings className="mr-2" />
                  <span>{t("profile.settings")}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t("profile.logout")}>
                <LogOut className="mr-2" />
                <span>{t("profile.logout")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <div className="p-2">
            <Link href="/register">
              <Button variant="outline" className="w-full" size="sm">
                {t("auth.register")}
              </Button>
            </Link>
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
