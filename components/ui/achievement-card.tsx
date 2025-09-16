'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from './card'
import { Achievement, AchievementSystem } from '@/lib/achievements'
import { cn } from '@/lib/utils'

interface AchievementCardProps {
  achievement: Achievement
  isUnlocked: boolean
  progress?: number
  onClick?: () => void
}

export function AchievementCard({ achievement, isUnlocked, progress = 0, onClick }: AchievementCardProps) {
  const rarityColor = AchievementSystem.getRarityColor(achievement.rarity)
  const rarityBorderColor = AchievementSystem.getRarityBorderColor(achievement.rarity)

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={cn(
        'cyber-card transition-all duration-300',
        rarityBorderColor,
        isUnlocked ? 'opacity-100' : 'opacity-60 grayscale',
        isUnlocked && 'shadow-lg hover:shadow-xl'
      )}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Icon and Rarity */}
            <div className="flex items-center justify-between">
              <div className="text-3xl">
                {achievement.icon}
              </div>
              <div className={cn(
                'text-xs px-2 py-1 rounded border',
                rarityColor,
                rarityBorderColor,
                'capitalize'
              )}>
                {achievement.rarity}
              </div>
            </div>

            {/* Achievement Info */}
            <div className="space-y-1">
              <h3 className={cn(
                'font-bold',
                isUnlocked ? rarityColor : 'text-gray-400'
              )}>
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-400">
                {achievement.description}
              </p>
            </div>

            {/* Progress Bar */}
            {!isUnlocked && progress > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Progress</span>
                  <span>{Math.min(progress, achievement.requirement)}/{achievement.requirement}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((progress / achievement.requirement) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'h-2 rounded-full',
                      achievement.rarity === 'common' && 'bg-gray-400',
                      achievement.rarity === 'rare' && 'bg-blue-400',
                      achievement.rarity === 'epic' && 'bg-purple-400',
                      achievement.rarity === 'legendary' && 'bg-yellow-400'
                    )}
                  />
                </div>
              </div>
            )}

            {/* XP Reward */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">奖励</span>
              <span className={cn(
                'font-bold',
                isUnlocked ? 'text-neon-green' : 'text-gray-400'
              )}>
                +{achievement.xpReward} XP
              </span>
            </div>

            {/* Unlock Status */}
            {isUnlocked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center text-xs text-neon-green font-bold"
              >
                ✓ 已解锁
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}