import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from 'lucide-react'

interface TransitionPageProps {
  message?: string
  duration?: number
  onComplete?: () => void
}

export default function TransitionPage({
  message = "Loading your experience",
  duration = 2000,
  onComplete,
}: TransitionPageProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration

    const updateProgress = () => {
      const currentTime = Date.now()
      const elapsed = currentTime - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      
      setProgress(newProgress)

      if (currentTime < endTime) {
        requestAnimationFrame(updateProgress)
      } else if (onComplete) {
        onComplete()
      }
    }

    requestAnimationFrame(updateProgress)
  }, [duration, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md px-8">
        <div className="mb-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="absolute inset-y-0 left-0 bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {message}
          <span className="inline-block animate-pulse">...</span>
        </div>
      </div>
    </div>
  )
}