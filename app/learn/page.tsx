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
import { StudyRating, WordCard } from '@/types/client'

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
  const [words, setWords] = useState<WordCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 从API获取学习单词
  useEffect(() => {
    const fetchWords = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/words/learn?userId=default_user&mode=${studyMode}&limit=10`)
        
        if (!response.ok) {
          throw new Error('获取单词失败')
        }
        
        const data = await response.json()
        
        if (data.success && data.words.length > 0) {
          const formattedWords: WordCard[] = data.words.map((word: any) => ({
            id: word.id || word.word_id,
            word: word.word,
            phonetic: word.phonetic || '',
            meaning: word.meaning,
            example: word.example || '',
            image_url: word.image_url,
            category: word.category || 'general',
            isNew: word.isNew || !word.last_studied
          }))
          
          setWords(formattedWords)
          setSessionStats(prev => ({
            ...prev,
            remaining: formattedWords.length
          }))
        } else {
          setError('没有找到可学习的单词，请先上传单词本')
        }
      } catch (error) {
        console.error('Failed to fetch words:', error)
        setError('获取单词失败，请检查网络连接')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWords()
  }, [studyMode])

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

  const handleRating = async (rating: StudyRating) => {
    if (!currentWord) return
    
    const isCorrect = rating >= StudyRating.HARD
    
    try {
      // 更新服务器端学习记录
      const response = await fetch('/api/words/learn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'default_user',
          wordId: currentWord.id,
          rating: rating
        })
      })
      
      if (!response.ok) {
        throw new Error('更新学习记录失败')
      }
      
      // 更新本地统计
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
          alert('学习会话完成！获得了 ' + (sessionStats.correct + (isCorrect ? 1 : 0)) * 10 + ' 经验值！')
          window.location.href = '/'
        }
      }, 500)
      
    } catch (error) {
      console.error('Failed to update learning record:', error)
      // 即使更新失败，也继续到下一个单词
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1)
          setIsFlipped(false)
          setShowAnswer(false)
        } else {
          alert('学习会话完成！')
          window.location.href = '/'
        }
      }, 500)
    }
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

  // 加载状态
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-neon-blue mb-4">正在加载单词...</h1>
          <p className="text-gray-300">请稍候</p>
        </div>
      </div>
    )
  }

  // 错误状态或没有单词
  if (error || !currentWord) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            {error || '没有可学习的单词'}
          </h1>
          <p className="text-gray-300 mb-8">
            {error ? '请检查网络连接后重试' : '请先上传单词本或等待新单词推送'}
          </p>
          <div className="space-x-4">
            <Button variant="neon" onClick={() => window.location.href = '/upload'}>
              <BookOpen className="w-4 h-4 mr-2" />
              上传单词本
            </Button>
            {error && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                重新加载
              </Button>
            )}
          </div>
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