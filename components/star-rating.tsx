"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating?: number
  maxRating?: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)

  const handleMouseEnter = (index: number) => {
    if (readOnly) return
    setHoverRating(index)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverRating(0)
  }

  const handleClick = (index: number) => {
    if (readOnly) return
    setSelectedRating(index)
    onChange?.(index)
  }

  const getSizeClass = () => {
    switch (size) {
      case "xs":
        return "h-3 w-3"
      case "sm":
        return "h-4 w-4"
      case "md":
        return "h-5 w-5"
      case "lg":
        return "h-6 w-6"
      default:
        return "h-5 w-5"
    }
  }

  const getContainerClass = () => {
    switch (size) {
      case "xs":
        return "gap-0.5"
      case "sm":
        return "gap-1"
      case "md":
        return "gap-1.5"
      case "lg":
        return "gap-2"
      default:
        return "gap-1.5"
    }
  }

  return (
    <div className={cn("flex items-center", getContainerClass(), className)}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        const isActive = (hoverRating || selectedRating) >= starValue

        return (
          <Star
            key={index}
            className={cn(
              getSizeClass(),
              "cursor-pointer transition-colors",
              isActive ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300",
              readOnly && "cursor-default",
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          />
        )
      })}
    </div>
  )
}
