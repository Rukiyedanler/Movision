"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export function NotificationsPopover() {
  const { user, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  // Count unread notifications
  const unreadCount = user?.notifications?.filter((n) => !n.read).length || 0

  // Mark all as read when popover is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllNotificationsAsRead()
    }
  }, [isOpen, unreadCount, markAllNotificationsAsRead])

  const handleViewAll = () => {
    setIsOpen(false)
    router.push("/notifications")
  }

  if (!user) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Bildirimler</h3>
          {user.notifications && user.notifications.some((n) => !n.read) && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllNotificationsAsRead}>
              <Check className="mr-1 h-3 w-3" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
        {user.notifications && user.notifications.length > 0 ? (
          <>
            <ScrollArea className="h-[300px]">
              <div className="divide-y">
                {user.notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 ${
                      notification.read ? "opacity-60" : "bg-muted/40"
                    } border-b last:border-b-0`}
                  >
                    <div
                      className={`w-2 h-2 mt-2 rounded-full ${notification.read ? "bg-muted-foreground" : "bg-primary"}`}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium leading-none">{notification.title}</p>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation()
                                markNotificationAsRead(notification.id)
                              }}
                              title="Okundu olarak işaretle"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            title="Bildirimi sil"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-2 border-t text-center">
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleViewAll}>
                Tüm Bildirimleri Görüntüle
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Bildiriminiz bulunmuyor.</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
