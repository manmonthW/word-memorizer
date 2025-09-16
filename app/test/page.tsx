'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Edit3, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Timer, 
  Trophy, 
  Home,
  Zap,
  Target,
  Star
} from 'lucide-react'

interface TestQuestion {
  id: number
  word: string
  phonetic: string
  correctAnswer: string
  options?: string[]
  type: 'multiple_choice' | 'spelling' | 'fill_blank'
  sentence?: string
  difficulty: number
}

interface TestResult {
  questionId: number
  isCorrect: boolean
  userAnswer: string
  timeSpent: number
}

export default function TestPage() {
  const [testType, setTestType] = useState<'multiple_choice' | 'spelling' | 'fill_blank'>('multiple_choice')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [testStartTime] = useState(Date.now())
  const [isTestCompleted, setIsTestCompleted] = useState(false)

  // 模拟测试题目数据
  const [questions] = useState<TestQuestion[]>([
    {
      id: 1,
      word: "serendipity",
      phonetic: "/ˌserənˈdipədē/",
      correctAnswer: "意外发现珍奇事物的能力",
      options: ["意外发现珍奇事物的能力", "非常快乐的状态", "困难的处境", "复杂的问题"],
      type: "multiple_choice",
      difficulty: 3
    },
    {
      id: 2,
      word: "ephemeral",
      phonetic: "/əˈfem(ə)rəl/",
      correctAnswer: "ephemeral",
      type: "spelling",
      difficulty: 2
    },
    {
      id: 3,
      word: "ubiquitous",
      phonetic: "/yo͞oˈbikwədəs/",
      correctAnswer: "ubiquitous",
      sentence: "Smartphones have become _____ in modern society.",
      type: "fill_blank",
      difficulty: 2
    }
  ])

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  useEffect(() => {
    setQuestionStartTime(Date.now())
  }, [currentQuestionIndex])

  const handleAnswer = (answer: string) => {
    const timeSpent = Date.now() - questionStartTime
    const isCorrect = answer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
    
    const result: TestResult = {
      questionId: currentQuestion.id,
      isCorrect,
      userAnswer: answer,
      timeSpent
    }

    setTestResults(prev => [...prev, result])
    setShowResult(true)

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setUserAnswer('')
        setShowResult(false)
      } else {
        setIsTestCompleted(true)
      }
    }, 2000)
  }

  const handleSubmitAnswer = () => {
    if (userAnswer.trim()) {
      handleAnswer(userAnswer)
    }
  }

  const getTestStats = () => {
    const correctAnswers = testResults.filter(r => r.isCorrect).length
    const totalTime = Math.floor((Date.now() - testStartTime) / 1000)
    const averageTime = testResults.length > 0 
      ? Math.floor(testResults.reduce((sum, r) => sum + r.timeSpent, 0) / testResults.length / 1000)
      : 0
    const accuracy = testResults.length > 0 ? Math.round((correctAnswers / testResults.length) * 100) : 0

    return { correctAnswers, totalTime, averageTime, accuracy }
  }

  if (isTestCompleted) {
    const stats = getTestStats()
    
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">
              测试完成！
            </h1>
            <p className="text-xl text-gray-300">你的表现很不错！</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="cyber-card border-neon-green/30">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-neon-green mx-auto mb-2" />
                <div className="text-2xl font-bold text-neon-green">{stats.correctAnswers}</div>
                <div className="text-sm text-gray-400">正确答案</div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-electric-purple/30">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-electric-purple mx-auto mb-2" />
                <div className="text-2xl font-bold text-electric-purple">{stats.accuracy}%</div>
                <div className="text-sm text-gray-400">准确率</div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-neon-blue/30">
              <CardContent className="p-6 text-center">
                <Timer className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                <div className="text-2xl font-bold text-neon-blue">{stats.totalTime}s</div>
                <div className="text-sm text-gray-400">总时间</div>
              </CardContent>
            </Card>

            <Card className="cyber-card border-yellow-500/30">
              <CardContent className="p-6 text-center">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-500">+{stats.correctAnswers * 10}</div>
                <div className="text-sm text-gray-400">经验值</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-300">答题详情</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <Card key={index} className={`cyber-card ${result.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {result.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className="font-medium text-gray-300">
                          {questions[index].word}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {Math.floor(result.timeSpent / 1000)}s
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button variant="neon" onClick={() => window.location.reload()}>
              再次测试
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </motion.div>
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            <h1 className="text-2xl font-bold text-neon-blue">单词测试</h1>
          </div>
          
          <div className="text-sm text-gray-400">
            题目 {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>测试进度</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Test Mode Selector */}
        <Tabs value={testType} onValueChange={(value) => setTestType(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-white/10">
            <TabsTrigger value="multiple_choice" className="data-[state=active]:bg-neon-blue data-[state=active]:text-black">
              <Brain className="w-4 h-4 mr-2" />
              选择题
            </TabsTrigger>
            <TabsTrigger value="spelling" className="data-[state=active]:bg-electric-purple data-[state=active]:text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              拼写题
            </TabsTrigger>
            <TabsTrigger value="fill_blank" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
              <FileText className="w-4 h-4 mr-2" />
              填空题
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Question Card */}
        <Card className="cyber-card border-neon-blue/40 min-h-96">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-neon-blue">
                {testType === 'multiple_choice' && '选择正确的中文释义'}
                {testType === 'spelling' && '根据发音拼写单词'}
                {testType === 'fill_blank' && '填入合适的单词'}
              </CardTitle>
              <div className="text-xs bg-electric-purple/20 text-electric-purple px-2 py-1 rounded">
                难度: {currentQuestion.difficulty}/5
              </div>
            </div>
            <CardDescription>
              仔细思考后选择或输入答案
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Question */}
                <div className="text-center space-y-4">
                  {testType === 'multiple_choice' && (
                    <>
                      <h2 className="text-4xl font-bold text-neon-blue glow-text">
                        {currentQuestion.word}
                      </h2>
                      <p className="text-gray-400">{currentQuestion.phonetic}</p>
                    </>
                  )}

                  {testType === 'spelling' && (
                    <>
                      <p className="text-gray-400 mb-4">听音拼写以下单词：</p>
                      <div className="bg-black/30 p-6 rounded border border-neon-blue/30">
                        <p className="text-2xl text-neon-blue">{currentQuestion.phonetic}</p>
                        <p className="text-gray-400 mt-2">{currentQuestion.correctAnswer}</p>
                      </div>
                    </>
                  )}

                  {testType === 'fill_blank' && (
                    <>
                      <p className="text-gray-400 mb-4">在空白处填入合适的单词：</p>
                      <div className="bg-black/30 p-6 rounded border border-neon-green/30">
                        <p className="text-xl text-gray-300">
                          {currentQuestion.sentence?.replace('_____', '______')}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Answer Options/Input */}
                {!showResult && (
                  <div className="space-y-4">
                    {testType === 'multiple_choice' && currentQuestion.options && (
                      <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => handleAnswer(option)}
                            className="p-4 h-auto text-left justify-start hover:border-neon-blue hover:text-neon-blue"
                          >
                            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 text-sm">
                              {String.fromCharCode(65 + index)}
                            </span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {(testType === 'spelling' || testType === 'fill_blank') && (
                      <div className="space-y-4">
                        <Input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder={testType === 'spelling' ? '输入单词拼写' : '输入单词'}
                          className="text-lg p-4 bg-black/30 border-neon-green/30 focus:border-neon-green text-center"
                          onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                        />
                        <Button
                          variant="neon"
                          onClick={handleSubmitAnswer}
                          className="w-full"
                          disabled={!userAnswer.trim()}
                        >
                          提交答案
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Result Display */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4"
                    >
                      {testResults[testResults.length - 1]?.isCorrect ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-16 h-16 text-neon-green mx-auto" />
                          <h3 className="text-2xl font-bold text-neon-green">回答正确！</h3>
                          <p className="text-gray-300">继续保持，你做得很棒！</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                          <h3 className="text-2xl font-bold text-red-400">回答错误</h3>
                          <div className="bg-black/30 p-4 rounded border border-white/10">
                            <p className="text-gray-300">正确答案：</p>
                            <p className="text-neon-green text-lg font-bold">{currentQuestion.correctAnswer}</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-neon-green">{testResults.filter(r => r.isCorrect).length}</div>
              <div className="text-sm text-gray-400">正确</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-red-400">{testResults.filter(r => !r.isCorrect).length}</div>
              <div className="text-sm text-gray-400">错误</div>
            </CardContent>
          </Card>
          
          <Card className="cyber-card">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-neon-blue">{questions.length - testResults.length}</div>
              <div className="text-sm text-gray-400">剩余</div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}