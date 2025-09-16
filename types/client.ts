// 客户端类型定义（避免导入服务端库）

export enum StudyRating {
  AGAIN = 1,    // 完全忘记，需要重新学习
  HARD = 2,     // 困难，但记起来了
  GOOD = 3,     // 正常回忆
  EASY = 4,     // 简单，很快想起
}

export interface WordCard {
  id: number
  word: string
  phonetic: string
  meaning: string
  example: string
  image_url?: string
  category: string
  isNew: boolean
}

export interface TestQuestion {
  id: number
  word: string
  phonetic: string
  correctAnswer: string
  options?: string[]
  type: 'multiple_choice' | 'spelling' | 'fill_blank'
  sentence?: string
  difficulty: number
}

export interface TestResult {
  questionId: number
  isCorrect: boolean
  userAnswer: string
  timeSpent: number
}