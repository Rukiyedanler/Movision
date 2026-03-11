"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { AuthProvider } from "@/components/auth-provider"
import { RoomProvider } from "@/components/room-provider"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <AuthProvider>
          <RoomProvider>
            {children}
            <Toaster />
          </RoomProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
