'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, BookOpen, Target, Trophy, Zap, Star, Brain, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const [studyStats, setStudyStats] = useState({
    totalWords: 0,
    newWords: 0,
    reviewWords: 0,
    masteredWords: 0,
    todayProgress: 0,
    currentStreak: 7,
    level: 1,
    xp: 340,
    xpToNext: 500
  })

  // 加载本地存储的统计数据
  useEffect(() => {
    const loadStats = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { localDB } = await import('@/lib/local-storage')
          const stats = localDB.getStudyStats()
          
          // 计算今日进度（假设目标是学习10个新单词和复习所有到期单词）
          const todayGoalNew = 10
          const todayGoalReview = stats.todayReview
          const todayTotal = todayGoalNew + todayGoalReview
          const studiedToday = 0 // 这里可以从会话存储中获取今日已学习数量
          const todayProgress = todayTotal > 0 ? Math.min((studiedToday / todayTotal) * 100, 100) : 0
          
          setStudyStats(prev => ({
            ...prev,
            totalWords: stats.totalWords,
            newWords: stats.newWords,
            reviewWords: stats.todayReview,
            masteredWords: stats.masteredWords,
            todayProgress: Math.round(todayProgress)
          }))
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      }
    }

    loadStats()
  }, [])

  const [todayGoal] = useState({
    newWords: 10,
    reviewWords: 15,
    studyTime: 30 // minutes
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-neon-blue via-electric-purple to-neon-green bg-clip-text text-transparent">
              张桓羽同学，准备好征服单词了吗？
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            使用科学的间隔重复算法，让记单词变得像游戏一样有趣
          </p>
        </motion.div>

        {/* Daily Progress Card */}
        <motion.div variants={itemVariants}>
          <Card className="cyber-card border-neon-blue/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-neon-blue glow-text flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    今日进度
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    继续保持，你正在创造记录！
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-neon-green">{studyStats.todayProgress}%</div>
                  <div className="text-sm text-gray-400">完成度</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={studyStats.todayProgress} className="h-3" />
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-black/30 rounded-lg p-3 border border-neon-blue/20">
                    <div className="text-2xl font-bold text-neon-blue">{todayGoal.newWords - 3}</div>
                    <div className="text-xs text-gray-400">新单词学习</div>
                    <div className="text-xs text-neon-blue">{todayGoal.newWords - 3}/{todayGoal.newWords}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-electric-purple/20">
                    <div className="text-2xl font-bold text-electric-purple">{todayGoal.reviewWords - 3}</div>
                    <div className="text-xs text-gray-400">复习单词</div>
                    <div className="text-xs text-electric-purple">{todayGoal.reviewWords - 3}/{todayGoal.reviewWords}</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 border border-neon-green/20">
                    <div className="text-2xl font-bold text-neon-green">{Math.round(todayGoal.studyTime * 0.7)}</div>
                    <div className="text-xs text-gray-400">学习时长(分钟)</div>
                    <div className="text-xs text-neon-green">{Math.round(todayGoal.studyTime * 0.7)}/{todayGoal.studyTime}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cyber-card border-neon-green/30 hover:border-neon-green/60 transition-all duration-300 cursor-pointer group"
                onClick={() => window.location.href = '/learn'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-neon-green/20 p-3 rounded-full group-hover:bg-neon-green/30 transition-colors">
                  <PlayCircle className="w-8 h-8 text-neon-green" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-neon-green">开始学习</h3>
                  <p className="text-gray-400">学习新单词或复习已学内容</p>
                </div>
                <Button variant="neon" size="lg" className="btn-hover-glow"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/learn';
                        }}>
                  开始
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="cyber-card border-electric-purple/30 hover:border-electric-purple/60 transition-all duration-300 cursor-pointer group"
                onClick={() => window.location.href = '/test'}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-electric-purple/20 p-3 rounded-full group-hover:bg-electric-purple/30 transition-colors">
                  <Brain className="w-8 h-8 text-electric-purple" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-electric-purple">智能测试</h3>
                  <p className="text-gray-400">检验学习成果，挑战自己</p>
                </div>
                <Button variant="outline" size="lg" className="border-electric-purple text-electric-purple hover:bg-electric-purple hover:text-black"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = '/test';
                        }}>
                  测试
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/10">
              <TabsTrigger value="stats" className="data-[state=active]:bg-neon-blue data-[state=active]:text-black">
                统计数据
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-electric-purple data-[state=active]:text-white">
                成就系统
              </TabsTrigger>
              <TabsTrigger value="upload" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
                单词本管理
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="cyber-card">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                    <div className="text-2xl font-bold text-neon-blue">{studyStats.totalWords}</div>
                    <div className="text-sm text-gray-400">总单词数</div>
                  </CardContent>
                </Card>
                
                <Card className="cyber-card">
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 text-neon-green mx-auto mb-2" />
                    <div className="text-2xl font-bold text-neon-green">{studyStats.masteredWords}</div>
                    <div className="text-sm text-gray-400">已掌握</div>
                  </CardContent>
                </Card>
                
                <Card className="cyber-card">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 text-electric-purple mx-auto mb-2" />
                    <div className="text-2xl font-bold text-electric-purple">{studyStats.currentStreak}</div>
                    <div className="text-sm text-gray-400">连续天数</div>
                  </CardContent>
                </Card>
                
                <Card className="cyber-card">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-cyber-orange mx-auto mb-2" />
                    <div className="text-2xl font-bold text-cyber-orange">{studyStats.level}</div>
                    <div className="text-sm text-gray-400">当前等级</div>
                  </CardContent>
                </Card>
              </div>

              {/* XP Progress */}
              <Card className="cyber-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">经验值进度</span>
                    <span className="text-sm text-neon-blue">{studyStats.xp}/{studyStats.xpToNext} XP</span>
                  </div>
                  <Progress value={(studyStats.xp / studyStats.xpToNext) * 100} className="h-2" />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="cyber-card border-yellow-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-bold text-yellow-500">连续学习者</h4>
                        <p className="text-sm text-gray-400">连续学习7天</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="cyber-card border-gray-500/30 opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-8 h-8 text-gray-500" />
                      <div>
                        <h4 className="font-bold text-gray-500">单词大师</h4>
                        <p className="text-sm text-gray-400">掌握100个单词 (67/100)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <Card className="cyber-card">
                <CardHeader>
                  <CardTitle className="text-neon-green">上传单词本</CardTitle>
                  <CardDescription>
                    支持 CSV 和 TXT 格式的单词本文件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="border-2 border-dashed border-neon-green/30 rounded-lg p-8 text-center hover:border-neon-green/60 transition-colors cursor-pointer"
                    onClick={() => window.location.href = '/upload'}
                  >
                    <BookOpen className="w-12 h-12 text-neon-green mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">点击或拖拽文件到此处</p>
                    <p className="text-sm text-gray-500">支持 .csv, .txt 格式</p>
                  </div>
                  <div className="mt-4 text-center">
                    <Button 
                      variant="neon" 
                      onClick={() => window.location.href = '/upload'}
                      className="w-full"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      进入单词本管理
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}