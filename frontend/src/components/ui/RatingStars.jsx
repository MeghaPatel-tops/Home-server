import React from 'react'
import { Star } from 'lucide-react'

export default function RatingStars({ rating = 5, max = 5, onChange = null, size = 'w-4 h-4' }) {
  const isInteractive = typeof onChange === 'function'

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const starValue = idx + 1
        const isFilled = starValue <= rating

        return (
          <button
            key={idx}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(starValue)}
            className={`${isInteractive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              className={`${size} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 fill-slate-100'
              } transition-colors`}
            />
          </button>
        )
      })}
    </div>
  )
}
