'use client'

import { motion } from 'framer-motion'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

interface GamingButtonProps extends ButtonProps {
  glowEffect?: boolean
  pulseEffect?: boolean
  rippleEffect?: boolean
  soundEffect?: boolean
}

export function GamingButton({ 
  children, 
  className, 
  glowEffect = false,
  pulseEffect = false,
  rippleEffect = false,
  soundEffect = false,
  onClick,
  ...props 
}: GamingButtonProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 添加音效
    if (soundEffect && typeof window !== 'undefined') {
      // 这里可以添加音效播放逻辑
      // const audio = new Audio('/sounds/click.mp3')
      // audio.play().catch(() => {})
    }

    // 涟漪效果
    if (rippleEffect) {
      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2
      
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
      `
      
      button.style.position = 'relative'
      button.style.overflow = 'hidden'
      button.appendChild(ripple)
      
      setTimeout(() => {
        button.removeChild(ripple)
      }, 600)
    }

    if (onClick) {
      onClick(e)
    }
  }

  return (
    <>
      <style jsx global>{`
        @keyframes ripple-animation {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 5px currentColor;
          }
          50% {
            box-shadow: 0 0 20px currentColor, 0 0 30px currentColor;
          }
        }
        
        .gaming-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .gaming-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          className={cn(
            'relative transition-all duration-300',
            glowEffect && 'gaming-glow',
            pulseEffect && 'gaming-pulse',
            'hover:shadow-lg hover:shadow-current/25',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    </>
  )
}