import { localDB, StoredLearningRecord } from './local-storage';

// SRS算法配置
export const SRS_CONFIG = {
  INITIAL_INTERVAL: 1,        // 初始间隔（天）
  GRADUATING_INTERVAL: 1,     // 毕业间隔（天）
  EASY_INTERVAL: 4,          // 简单间隔（天）
  MAX_INTERVAL: 365,         // 最大间隔（天）
  MIN_EASE_FACTOR: 1.3,
  MAX_EASE_FACTOR: 2.5,
  DEFAULT_EASE_FACTOR: 2.5,
};

// 学习评级枚举
export enum StudyRating {
  AGAIN = 1,    // 完全忘记，需要重新学习
  HARD = 2,     // 困难，但记起来了
  GOOD = 3,     // 正常回忆
  EASY = 4,     // 简单，很快想起
}

// SRS算法核心类
export class LocalSRSAlgorithm {
  
  /**
   * 计算下次复习时间和间隔
   */
  static calculateNextReview(
    currentRecord: Partial<StoredLearningRecord>, 
    rating: StudyRating
  ): Partial<StoredLearningRecord> {
    const now = new Date();
    let newInterval = currentRecord.intervalDays || SRS_CONFIG.INITIAL_INTERVAL;
    let newEaseFactor = currentRecord.easeFactor || SRS_CONFIG.DEFAULT_EASE_FACTOR;
    let newStatus = currentRecord.status || 'new';

    // 根据评级调整难度因子
    newEaseFactor = this.adjustEaseFactor(newEaseFactor, rating);

    // 根据评级和当前状态计算新间隔
    if (rating === StudyRating.AGAIN) {
      // 答错了，重新开始
      newInterval = SRS_CONFIG.INITIAL_INTERVAL;
      newStatus = 'learning';
    } else {
      // 答对了，根据当前状态和评级计算间隔
      if (currentRecord.status === 'new') {
        newStatus = 'learning';
        newInterval = this.getNewCardInterval(rating);
      } else {
        newStatus = 'review';
        newInterval = this.calculateIntervalForReview(newInterval, newEaseFactor, rating);
      }
    }

    // 确保间隔在合理范围内
    newInterval = Math.min(newInterval, SRS_CONFIG.MAX_INTERVAL);
    newInterval = Math.max(newInterval, SRS_CONFIG.INITIAL_INTERVAL);

    // 计算下次复习时间
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    // 检查是否达到掌握标准
    const studyCount = (currentRecord.studyCount || 0) + 1;
    const correctCount = (currentRecord.correctCount || 0) + (rating >= StudyRating.HARD ? 1 : 0);
    
    if (newInterval >= 21 && correctCount >= 5 && rating >= StudyRating.GOOD) {
      newStatus = 'mastered';
    }

    return {
      intervalDays: newInterval,
      easeFactor: newEaseFactor,
      status: newStatus,
      nextReview: nextReview.toISOString(),
      lastStudied: now.toISOString(),
      studyCount,
      correctCount,
    };
  }

  /**
   * 调整难度因子
   */
  private static adjustEaseFactor(currentEase: number, rating: StudyRating): number {
    let newEase = currentEase;

    switch (rating) {
      case StudyRating.AGAIN:
        newEase = Math.max(currentEase - 0.2, SRS_CONFIG.MIN_EASE_FACTOR);
        break;
      case StudyRating.HARD:
        newEase = Math.max(currentEase - 0.15, SRS_CONFIG.MIN_EASE_FACTOR);
        break;
      case StudyRating.GOOD:
        // 保持不变
        break;
      case StudyRating.EASY:
        newEase = Math.min(currentEase + 0.15, SRS_CONFIG.MAX_EASE_FACTOR);
        break;
    }

    return Math.round(newEase * 100) / 100;
  }

  /**
   * 获取新卡片的间隔
   */
  private static getNewCardInterval(rating: StudyRating): number {
    switch (rating) {
      case StudyRating.AGAIN:
        return SRS_CONFIG.INITIAL_INTERVAL;
      case StudyRating.HARD:
        return SRS_CONFIG.GRADUATING_INTERVAL * 0.5;
      case StudyRating.GOOD:
        return SRS_CONFIG.GRADUATING_INTERVAL;
      case StudyRating.EASY:
        return SRS_CONFIG.EASY_INTERVAL;
      default:
        return SRS_CONFIG.GRADUATING_INTERVAL;
    }
  }

  /**
   * 计算复习卡片的间隔
   */
  private static calculateIntervalForReview(
    currentInterval: number, 
    easeFactor: number, 
    rating: StudyRating
  ): number {
    let newInterval = currentInterval;

    switch (rating) {
      case StudyRating.HARD:
        newInterval = currentInterval * 1.2;
        break;
      case StudyRating.GOOD:
        newInterval = currentInterval * easeFactor;
        break;
      case StudyRating.EASY:
        newInterval = currentInterval * easeFactor * 1.3;
        break;
    }

    return Math.round(newInterval * 10) / 10;
  }

  /**
   * 更新学习记录
   */
  static updateLearningRecord(wordId: number, rating: StudyRating): void {
    const records = localDB.getLearningRecords();
    const existingRecord = records.find(r => r.wordId === wordId);
    
    // 计算新的复习数据
    const updates = this.calculateNextReview(existingRecord || {}, rating);
    
    // 更新本地存储
    localDB.updateLearningRecord(wordId, updates);
  }

  /**
   * 获取混合学习单词列表
   */
  static getMixedStudyWords(limit: number = 10): any[] {
    // 优先获取复习单词
    const reviewWords = localDB.getReviewWords();
    const remainingSlots = Math.max(0, limit - reviewWords.length);
    
    // 如果还有空余位置，获取新单词
    const newWords = remainingSlots > 0 ? localDB.getNewWords(remainingSlots) : [];
    
    // 格式化返回数据
    const formattedReviewWords = reviewWords.map(word => ({
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning,
      example: word.example,
      category: word.category,
      isNew: false,
      last_studied: word.learningRecord.lastStudied,
      study_count: word.learningRecord.studyCount
    }));

    const formattedNewWords = newWords.map(word => ({
      id: word.id,
      word: word.word,
      phonetic: word.phonetic,
      meaning: word.meaning,
      example: word.example,
      category: word.category,
      isNew: true,
      last_studied: null,
      study_count: 0
    }));

    return [...formattedReviewWords, ...formattedNewWords];
  }
}