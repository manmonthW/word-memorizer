// 单词数据类型
export interface Word {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  image_url?: string;
  difficulty_level: number; // 1-5 难度级别
  category: string;
  created_at: string;
  updated_at: string;
}

// 学习记录类型
export interface LearningRecord {
  id: number;
  word_id: number;
  user_id: string;
  study_count: number; // 学习次数
  correct_count: number; // 正确次数
  last_studied: string; // 最后学习时间
  next_review: string; // 下次复习时间
  interval_days: number; // 复习间隔（天）
  ease_factor: number; // 难度因子 (SRS算法用)
  status: 'new' | 'learning' | 'review' | 'mastered';
  created_at: string;
  updated_at: string;
}

// 测试记录类型
export interface TestRecord {
  id: number;
  word_id: number;
  user_id: string;
  test_type: 'multiple_choice' | 'spelling' | 'fill_blank';
  is_correct: boolean;
  response_time_ms: number; // 回答时间（毫秒）
  test_date: string;
}

// 用户成就类型
export interface UserAchievement {
  id: number;
  user_id: string;
  achievement_type: 'daily_streak' | 'words_mastered' | 'perfect_test' | 'level_up';
  achievement_value: number;
  unlocked_at: string;
}

// 用户统计类型
export interface UserStats {
  id: number;
  user_id: string;
  total_words: number;
  words_mastered: number;
  current_streak: number;
  longest_streak: number;
  total_study_time_minutes: number;
  level: number;
  experience_points: number;
  last_active: string;
  created_at: string;
  updated_at: string;
}

// 单词本类型
export interface Wordbook {
  id: number;
  name: string;
  description: string;
  user_id: string;
  total_words: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// SRS复习间隔配置
export interface SRSConfig {
  new_interval: number; // 新单词首次复习间隔（分钟）
  graduating_interval: number; // 毕业间隔（天）
  easy_interval: number; // 简单间隔（天）
  interval_modifier: number; // 间隔修正因子
  max_interval: number; // 最大间隔（天）
}

// 学习会话类型
export interface StudySession {
  id: number;
  user_id: string;
  session_type: 'learn' | 'review' | 'test';
  words_studied: number;
  correct_answers: number;
  session_duration_minutes: number;
  started_at: string;
  completed_at: string;
}