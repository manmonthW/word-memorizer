'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Trophy, Zap, Star, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'achievement' | 'level_up' | 'streak'
  title: string
  message: string
  duration?: number
}

interface FloatingNotificationProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function FloatingNotification({ notifications, onRemove }: FloatingNotificationProps) {
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    notifications.forEach((notification) => {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration || 5000)
      timers.push(timer)
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [notifications, onRemove])

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-neon-green" />
      case 'achievement':
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 'level_up':
        return <Star className="w-6 h-6 text-electric-purple" />
      case 'streak':
        return <Zap className="w-6 h-6 text-neon-blue" />
      default:
        return <CheckCircle className="w-6 h-6 text-neon-green" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-neon-green/50 bg-neon-green/10'
      case 'achievement':
        return 'border-yellow-500/50 bg-yellow-500/10'
      case 'level_up':
        return 'border-electric-purple/50 bg-electric-purple/10'
      case 'streak':
        return 'border-neon-blue/50 bg-neon-blue/10'
      default:
        return 'border-neon-green/50 bg-neon-green/10'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className={`
              relative max-w-sm rounded-lg border p-4 backdrop-blur-sm
              ${getColors(notification.type)}
            `}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {notification.title}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}