import database from './database'
import { UserAchievement, UserStats } from '@/types'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  type: 'daily_streak' | 'words_mastered' | 'perfect_test' | 'level_up' | 'study_time'
  requirement: number
  xpReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export const ACHIEVEMENTS: Achievement[] = [
  // 连续学习成就
  {
    id: 'streak_3',
    name: '初学者',
    description: '连续学习3天',
    icon: '🔥',
    type: 'daily_streak',
    requirement: 3,
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: '坚持者',
    description: '连续学习7天',
    icon: '⚡',
    type: 'daily_streak',
    requirement: 7,
    xpReward: 100,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: '学习大师',
    description: '连续学习30天',
    icon: '👑',
    type: 'daily_streak',
    requirement: 30,
    xpReward: 500,
    rarity: 'legendary'
  },

  // 单词掌握成就
  {
    id: 'words_50',
    name: '词汇新手',
    description: '掌握50个单词',
    icon: '📚',
    type: 'words_mastered',
    requirement: 50,
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'words_100',
    name: '词汇达人',
    description: '掌握100个单词',
    icon: '🎓',
    type: 'words_mastered',
    requirement: 100,
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'words_500',
    name: '词汇专家',
    description: '掌握500个单词',
    icon: '🏆',
    type: 'words_mastered',
    requirement: 500,
    xpReward: 1000,
    rarity: 'epic'
  },

  // 测试成就
  {
    id: 'perfect_test_first',
    name: '完美首秀',
    description: '首次测试获得100%正确率',
    icon: '⭐',
    type: 'perfect_test',
    requirement: 1,
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'perfect_test_5',
    name: '连战连胜',
    description: '5次测试获得100%正确率',
    icon: '💎',
    type: 'perfect_test',
    requirement: 5,
    xpReward: 500,
    rarity: 'epic'
  },

  // 等级成就
  {
    id: 'level_5',
    name: '进阶学者',
    description: '达到等级5',
    icon: '🌟',
    type: 'level_up',
    requirement: 5,
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'level_10',
    name: '资深学者',
    description: '达到等级10',
    icon: '🎖️',
    type: 'level_up',
    requirement: 10,
    xpReward: 500,
    rarity: 'epic'
  },

  // 学习时长成就
  {
    id: 'study_60min',
    name: '专注学习者',
    description: '单日学习60分钟',
    icon: '⏰',
    type: 'study_time',
    requirement: 60,
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'study_180min',
    name: '学习马拉松',
    description: '单日学习180分钟',
    icon: '🏃',
    type: 'study_time',
    requirement: 180,
    xpReward: 300,
    rarity: 'epic'
  }
]

export class AchievementSystem {
  /**
   * 检查并解锁成就
   */
  static async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const userStats = await this.getUserStats(userId)
    const unlockedAchievements = await this.getUnlockedAchievements(userId)
    const unlockedIds = new Set(unlockedAchievements.map(a => a.achievement_type))
    
    const newAchievements: Achievement[] = []

    for (const achievement of ACHIEVEMENTS) {
      if (unlockedIds.has(achievement.id)) {
        continue // 已解锁
      }

      let shouldUnlock = false

      switch (achievement.type) {
        case 'daily_streak':
          shouldUnlock = userStats.current_streak >= achievement.requirement
          break
        case 'words_mastered':
          shouldUnlock = userStats.words_mastered >= achievement.requirement
          break
        case 'level_up':
          shouldUnlock = userStats.level >= achievement.requirement
          break
        case 'perfect_test':
          // 需要查询测试记录
          const perfectTests = await this.getPerfectTestCount(userId)
          shouldUnlock = perfectTests >= achievement.requirement
          break
        case 'study_time':
          // 检查今日学习时长
          const todayStudyTime = await this.getTodayStudyTime(userId)
          shouldUnlock = todayStudyTime >= achievement.requirement
          break
      }

      if (shouldUnlock) {
        await this.unlockAchievement(userId, achievement)
        newAchievements.push(achievement)
      }
    }

    return newAchievements
  }

  /**
   * 解锁成就
   */
  private static async unlockAchievement(userId: string, achievement: Achievement): Promise<void> {
    await database.run(
      'INSERT INTO user_achievements (user_id, achievement_type, achievement_value) VALUES (?, ?, ?)',
      [userId, achievement.id, achievement.requirement]
    )

    // 增加经验值
    await database.run(
      'UPDATE user_stats SET experience_points = experience_points + ? WHERE user_id = ?',
      [achievement.xpReward, userId]
    )

    // 检查是否需要升级
    await this.checkLevelUp(userId)
  }

  /**
   * 检查等级提升
   */
  private static async checkLevelUp(userId: string): Promise<void> {
    const userStats = await this.getUserStats(userId)
    const requiredXP = this.getRequiredXPForLevel(userStats.level + 1)
    
    if (userStats.experience_points >= requiredXP) {
      await database.run(
        'UPDATE user_stats SET level = level + 1 WHERE user_id = ?',
        [userId]
      )
    }
  }

  /**
   * 获取等级所需经验值
   */
  private static getRequiredXPForLevel(level: number): number {
    return level * 100 + (level - 1) * 50 // 递增的经验值需求
  }

  /**
   * 获取用户统计
   */
  private static async getUserStats(userId: string): Promise<UserStats> {
    const stats = await database.get<UserStats>(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    )
    
    if (!stats) {
      // 创建默认统计
      await database.run(
        'INSERT INTO user_stats (user_id) VALUES (?)',
        [userId]
      )
      return this.getUserStats(userId)
    }
    
    return stats
  }

  /**
   * 获取已解锁的成就
   */
  private static async getUnlockedAchievements(userId: string): Promise<UserAchievement[]> {
    return await database.all<UserAchievement>(
      'SELECT * FROM user_achievements WHERE user_id = ?',
      [userId]
    )
  }

  /**
   * 获取完美测试次数
   */
  private static async getPerfectTestCount(userId: string): Promise<number> {
    // 这里需要根据测试记录计算
    // 暂时返回模拟数据
    return 0
  }

  /**
   * 获取今日学习时长
   */
  private static async getTodayStudyTime(userId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0]
    const sessions = await database.all(
      `SELECT session_duration_minutes FROM study_sessions 
       WHERE user_id = ? AND DATE(started_at) = ?`,
      [userId, today]
    )
    
    return sessions.reduce((total, session) => total + (session.session_duration_minutes || 0), 0)
  }

  /**
   * 获取成就详情
   */
  static getAchievementById(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id)
  }

  /**
   * 获取稀有度颜色
   */
  static getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  /**
   * 获取稀有度边框颜色
   */
  static getRarityBorderColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'border-gray-400/30'
      case 'rare': return 'border-blue-400/30'
      case 'epic': return 'border-purple-400/30'
      case 'legendary': return 'border-yellow-400/30'
      default: return 'border-gray-400/30'
    }
  }
}