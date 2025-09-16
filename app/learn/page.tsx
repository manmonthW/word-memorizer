'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  RotateCcw, 
  Volume2, 
  BookOpen, 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle, 
  SkipForward,
  Home,
  Timer
} from 'lucide-react'
import { StudyRating } from '@/lib/srs'

interface WordCard {
  id: number
  word: string
  phonetic: string
  meaning: string
  example: string
  image_url?: string
  category: string
  isNew: boolean
}

export default function LearnPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyMode, setStudyMode] = useState<'learn' | 'review'>('learn')
  const [sessionStats, setSessionStats] = useState({
    studied: 0,
    correct: 0,
    remaining: 10,
    timeSpent: 0
  })
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStartTime] = useState(Date.now())

  // 模拟单词数据 - 在实际应用中从API获取
  const [words] = useState<WordCard[]>([
    {
      id: 1,
      word: "serendipity",
      phonetic: "/ˌserənˈdipədē/",
      meaning: "意外发现珍奇事物的能力；机缘巧合",
      example: "Finding that book was pure serendipity.",
      category: "advanced",
      isNew: true
    },
    {
      id: 2,
      word: "ephemeral",
      phonetic: "/əˈfem(ə)rəl/",
      meaning: "短暂的；朝生暮死的",
      example: "The beauty of cherry blossoms is ephemeral.",
      category: "advanced",
      isNew: false
    },
    {
      id: 3,
      word: "ubiquitous",
      phonetic: "/yo͞oˈbikwədəs/",
      meaning: "无处不在的；普遍存在的",
      example: "Smartphones have become ubiquitous in modern society.",
      category: "academic",
      isNew: true
    }
  ])

  const currentWord = words[currentWordIndex]
  const progress = ((currentWordIndex + 1) / words.length) * 100

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionStats(prev => ({
        ...prev,
        timeSpent: Math.floor((Date.now() - sessionStartTime) / 1000)
      }))
    }, 1000)

    return () => clearInterval(timer)
  }, [sessionStartTime])

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
    setShowAnswer(!showAnswer)
  }

  const handleRating = (rating: StudyRating) => {
    const isCorrect = rating >= StudyRating.HARD
    
    setSessionStats(prev => ({
      ...prev,
      studied: prev.studied + 1,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      remaining: prev.remaining - 1
    }))

    // 进入下一个单词
    setTimeout(() => {
      if (currentWordIndex < words.length - 1) {
        setCurrentWordIndex(prev => prev + 1)
        setIsFlipped(false)
        setShowAnswer(false)
      } else {
        // 学习会话结束
        alert('学习会话完成！')
      }
    }, 500)
  }

  const handleSkip = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setIsFlipped(false)
      setShowAnswer(false)
    }
  }

  const playPronunciation = () => {
    // 使用 Web Speech API 播放发音
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word)
      utterance.lang = 'en-US'
      speechSynthesis.speak(utterance)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentWord) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neon-blue mb-4">没有可学习的单词</h1>
          <p className="text-gray-300 mb-8">请先上传单词本或等待新单词推送</p>
          <Button variant="neon" onClick={() => window.location.href = '/upload'}>
            <BookOpen className="w-4 h-4 mr-2" />
            上传单词本
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header with Stats */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Timer className="w-4 h-4" />
              <span>{formatTime(sessionStats.timeSpent)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-neon-blue">{sessionStats.studied}</div>
              <div className="text-gray-400">已学习</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-neon-green">{sessionStats.correct}</div>
              <div className="text-gray-400">正确</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-electric-purple">{sessionStats.remaining}</div>
              <div className="text-gray-400">剩余</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>学习进度</span>
            <span>{currentWordIndex + 1} / {words.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Word Card */}
        <div className="relative h-96 flex justify-center items-center">
          <motion.div
            className="flip-card w-full max-w-md h-full"
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ perspective: 1000 }}
          >
            <div className="flip-card-inner relative w-full h-full">
              {/* Front Card - Word */}
              <Card className={`flip-card-front cyber-card border-neon-blue/40 absolute inset-0 ${isFlipped ? 'hidden' : 'block'}`}>
                <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center">
                  <div className="space-y-6">
                    {currentWord.isNew && (
                      <div className="bg-neon-green/20 text-neon-green px-3 py-1 rounded-full text-xs font-bold">
                        NEW
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-bold text-neon-blue glow-text">
                        {currentWord.word}
                      </h2>
                      
                      {currentWord.phonetic && (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-gray-400 text-lg">{currentWord.phonetic}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={playPronunciation}
                            className="hover:bg-neon-blue/20"
                          >
                            <Volume2 className="w-4 h-4 text-neon-blue" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/30 px-4 py-2 rounded border border-electric-purple/30">
                      <span className="text-electric-purple text-sm font-medium">
                        {currentWord.category}
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-gray-400 text-sm"
                    >
                      点击翻转查看释义
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* Back Card - Meaning */}
              <Card className={`flip-card-back cyber-card border-neon-green/40 absolute inset-0 ${!isFlipped ? 'hidden' : 'block'}`}>
                <CardContent className="flex flex-col justify-center items-center h-full p-8 text-center">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-neon-green mb-4">{currentWord.word}</h3>
                    
                    <div className="space-y-4">
                      <p className="text-xl text-gray-200 leading-relaxed">
                        {currentWord.meaning}
                      </p>
                      
                      {currentWord.example && (
                        <div className="bg-black/30 p-4 rounded border border-white/10">
                          <p className="text-gray-300 italic">"{currentWord.example}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Flip Button */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleCardFlip}
            className="absolute inset-0 w-full h-full bg-transparent hover:bg-transparent"
            style={{ zIndex: 10 }}
          >
            <span className="sr-only">翻转卡片</span>
          </Button>
        </div>

        {/* Action Buttons */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center text-gray-300 mb-4">
                你掌握这个单词的程度如何？
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleRating(StudyRating.AGAIN)}
                  className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white flex flex-col p-4 h-auto"
                >
                  <XCircle className="w-6 h-6 mb-2" />
                  <span>完全不会</span>
                  <span className="text-xs opacity-70">1分钟后</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(StudyRating.HARD)}
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black flex flex-col p-4 h-auto"
                >
                  <Brain className="w-6 h-6 mb-2" />
                  <span>有点困难</span>
                  <span className="text-xs opacity-70">6分钟后</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(StudyRating.GOOD)}
                  className="border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black flex flex-col p-4 h-auto"
                >
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span>正常回忆</span>
                  <span className="text-xs opacity-70">1天后</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => handleRating(StudyRating.EASY)}
                  className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black flex flex-col p-4 h-auto"
                >
                  <Zap className="w-6 h-6 mb-2" />
                  <span>很简单</span>
                  <span className="text-xs opacity-70">4天后</span>
                </Button>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  跳过
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleCardFlip}
                  className="text-gray-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再看一遍
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Study Mode Toggle */}
        <div className="text-center">
          <div className="inline-flex bg-black/30 rounded-lg p-1 border border-white/10">
            <Button
              variant={studyMode === 'learn' ? 'neon' : 'ghost'}
              size="sm"
              onClick={() => setStudyMode('learn')}
            >
              学习新词
            </Button>
            <Button
              variant={studyMode === 'review' ? 'neon' : 'ghost'}
              size="sm"
              onClick={() => setStudyMode('review')}
            >
              复习模式
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}