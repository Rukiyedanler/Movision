"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CommentSectionProps {
  contentId: string
  contentType: "movie" | "tv"
  title?: string
}

export function CommentSection({ contentId, contentType, title = "" }: CommentSectionProps) {
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const { isLoggedIn, user, addComment, removeComment } = useAuth()
  const commentSectionRef = useRef<HTMLDivElement>(null)

  // Load all user comments for this content
  const loadComments = useCallback(() => {
    if (!user) return

    // Get all users who commented on this content
    const allUsers = JSON.parse(localStorage.getItem("users") || "{}")
    const allComments = []

    // Collect comments from all users
    Object.values(allUsers).forEach((userData: any) => {
      const userInfo = userData.user
      const userComment = userInfo.comments?.find(
        (c) => c.contentId === Number(contentId) && c.contentType === contentType,
      )

      if (userComment) {
        allComments.push({
          id: `${userInfo.email}-${contentId}`,
          user: userInfo.name,
          avatar: userInfo.avatar,
          text: userComment.text,
          date: new Date(userComment.date).toLocaleDateString(),
          isCurrentUser: userInfo.email === user.email,
        })
      }
    })

    setComments(allComments)
  }, [user, contentId, contentType])

  // Load comments when component mounts or user changes
  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      toast({
        variant: "destructive",
        title: "Giriş Yapın",
        description: "Yorum yapabilmek için giriş yapmalısınız.",
      })
      return
    }

    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Boş Yorum",
        description: "Lütfen bir yorum yazın.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Get content title if not provided
      const contentTitle = title || document.title || `${contentType === "movie" ? "Film" : "Dizi"} #${contentId}`

      // Add comment
      addComment(Number(contentId), contentType, contentTitle, comment)

      // Reload comments to show the new comment
      loadComments()

      // Clear form
      setComment("")

      toast({
        title: "Yorum Eklendi",
        description: "Yorumunuz başarıyla eklendi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yorum eklenirken bir hata oluştu.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteComment = () => {
    if (!commentToDelete || !user) return

    try {
      // Extract content ID from comment ID
      removeComment(Number(contentId), contentType)

      // Update local comments list
      setComments((prevComments) => prevComments.filter((c) => c.id !== commentToDelete))

      toast({
        title: "Yorum Silindi",
        description: "Yorumunuz başarıyla silindi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Hata",
        description: "Yorum silinirken bir hata oluştu.",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCommentToDelete(null)
    }
  }

  return (
    <div className="space-y-6" ref={commentSectionRef}>
      <h2 className="text-2xl font-bold">Yorumlar</h2>

      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <Textarea
          placeholder={isLoggedIn ? "Düşüncelerinizi paylaşın..." : "Yorum yapmak için giriş yapın..."}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!isLoggedIn || isSubmitting}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!isLoggedIn || isSubmitting}>
            {isSubmitting ? "Gönderiliyor..." : "Yorum Yap"}
          </Button>
        </div>
      </form>

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={comment.avatar || "/placeholder.svg"} alt={comment.user} />
                    <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{comment.user}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                        {comment.isCurrentUser && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-700"
                            onClick={() => confirmDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz Yorum Yok</h3>
          <p className="text-muted-foreground mb-4">Bu içerik için ilk yorumu siz yapın.</p>
        </div>
      )}

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yorumu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu yorumu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
