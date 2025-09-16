import { LearningRecord } from '@/types';

// 只在服务端导入数据库
let database: any = null;
if (typeof window === 'undefined') {
  database = require('./database-new').default;
}

// SRS算法配置
export const SRS_CONFIG = {
  // 新单词的初始间隔（分钟）
  INITIAL_INTERVAL: 1,
  // 毕业间隔（天）
  GRADUATING_INTERVAL: 1,
  // 简单评级的间隔（天）
  EASY_INTERVAL: 4,
  // 最大间隔（天）
  MAX_INTERVAL: 365,
  // 间隔修正因子
  INTERVAL_MODIFIER: 1.0,
  // 难度因子范围
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
export class SRSAlgorithm {
  
  /**
   * 计算下次复习时间和间隔
   * @param record 当前学习记录
   * @param rating 用户评级
   * @returns 更新后的学习记录
   */
  static calculateNextReview(record: LearningRecord, rating: StudyRating): Partial<LearningRecord> {
    const now = new Date();
    let newInterval = record.interval_days;
    let newEaseFactor = record.ease_factor;
    let newStatus = record.status;

    // 根据评级调整难度因子
    newEaseFactor = this.adjustEaseFactor(record.ease_factor, rating);

    // 根据评级和当前状态计算新间隔
    if (rating === StudyRating.AGAIN) {
      // 答错了，重新开始
      newInterval = SRS_CONFIG.INITIAL_INTERVAL / (24 * 60); // 转换为天
      newStatus = 'learning';
    } else {
      // 答对了，根据当前状态和评级计算间隔
      if (record.status === 'new') {
        newStatus = 'learning';
        newInterval = this.getNewCardInterval(rating);
      } else {
        newStatus = 'review';
        newInterval = this.calculateIntervalForReview(record.interval_days, newEaseFactor, rating);
      }
    }

    // 确保间隔在合理范围内
    newInterval = Math.min(newInterval, SRS_CONFIG.MAX_INTERVAL);
    newInterval = Math.max(newInterval, SRS_CONFIG.INITIAL_INTERVAL / (24 * 60));

    // 计算下次复习时间
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    // 检查是否达到掌握标准
    if (newInterval >= 21 && record.correct_count >= 5 && rating >= StudyRating.GOOD) {
      newStatus = 'mastered';
    }

    return {
      interval_days: newInterval,
      ease_factor: newEaseFactor,
      status: newStatus,
      next_review: nextReview.toISOString(),
      last_studied: now.toISOString(),
      study_count: record.study_count + 1,
      correct_count: rating >= StudyRating.HARD ? record.correct_count + 1 : record.correct_count,
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

    return Math.round(newEase * 100) / 100; // 保留两位小数
  }

  /**
   * 获取新卡片的间隔
   */
  private static getNewCardInterval(rating: StudyRating): number {
    switch (rating) {
      case StudyRating.AGAIN:
        return SRS_CONFIG.INITIAL_INTERVAL / (24 * 60);
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
  private static calculateIntervalForReview(currentInterval: number, easeFactor: number, rating: StudyRating): number {
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

    return Math.round(newInterval * 10) / 10; // 保留一位小数
  }

  /**
   * 获取今日需要复习的单词
   */
  static async getTodayReviewWords(userId: string): Promise<LearningRecord[]> {
    if (!database) throw new Error('Database not available on client side');
    
    const now = new Date().toISOString();
    const sql = `
      SELECT lr.*, w.word, w.meaning, w.phonetic, w.example, w.image_url
      FROM learning_records lr
      JOIN words w ON lr.word_id = w.id
      WHERE lr.user_id = ? AND lr.next_review <= ?
      ORDER BY lr.next_review ASC
    `;
    
    return database.all<LearningRecord>(sql, [userId, now]);
  }

  /**
   * 获取新单词（尚未学习过的）
   */
  static async getNewWords(userId: string, limit: number = 10): Promise<any[]> {
    if (!database) throw new Error('Database not available on client side');
    
    const sql = `
      SELECT w.*, 
             CASE WHEN lr.id IS NULL THEN 1 ELSE 0 END as is_new
      FROM words w
      LEFT JOIN learning_records lr ON w.id = lr.word_id AND lr.user_id = ?
      WHERE lr.id IS NULL
      ORDER BY w.created_at ASC
      LIMIT ?
    `;
    
    return database.all(sql, [userId, limit]);
  }

  /**
   * 更新学习记录
   */
  static async updateLearningRecord(
    userId: string, 
    wordId: number, 
    rating: StudyRating
  ): Promise<void> {
    if (!database) throw new Error('Database not available on client side');
    
    // 获取当前记录
    let record = database.get<LearningRecord>(
      'SELECT * FROM learning_records WHERE user_id = ? AND word_id = ?',
      [userId, wordId]
    );

    if (!record) {
      // 创建新记录
      record = {
        id: 0,
        word_id: wordId,
        user_id: userId,
        study_count: 0,
        correct_count: 0,
        last_studied: '',
        next_review: '',
        interval_days: SRS_CONFIG.INITIAL_INTERVAL / (24 * 60),
        ease_factor: SRS_CONFIG.DEFAULT_EASE_FACTOR,
        status: 'new',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    // 计算新的复习数据
    const updates = this.calculateNextReview(record, rating);

    if (record.id === 0) {
      // 插入新记录
      database.run(
        `INSERT INTO learning_records 
         (word_id, user_id, study_count, correct_count, last_studied, next_review, 
          interval_days, ease_factor, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          wordId, userId, updates.study_count, updates.correct_count,
          updates.last_studied, updates.next_review, updates.interval_days,
          updates.ease_factor, updates.status
        ]
      );
    } else {
      // 更新现有记录
      database.run(
        `UPDATE learning_records 
         SET study_count = ?, correct_count = ?, last_studied = ?, next_review = ?,
             interval_days = ?, ease_factor = ?, status = ?
         WHERE id = ?`,
        [
          updates.study_count, updates.correct_count, updates.last_studied,
          updates.next_review, updates.interval_days, updates.ease_factor,
          updates.status, record.id
        ]
      );
    }
  }

  /**
   * 获取学习统计
   */
  static async getStudyStats(userId: string): Promise<{
    totalWords: number;
    newWords: number;
    learningWords: number;
    reviewWords: number;
    masteredWords: number;
    todayReview: number;
  }> {
    if (!database) throw new Error('Database not available on client side');
    
    const stats = database.get<any>(
      `SELECT 
        COUNT(DISTINCT w.id) as totalWords,
        COUNT(CASE WHEN lr.status IS NULL THEN 1 END) as newWords,
        COUNT(CASE WHEN lr.status = 'learning' THEN 1 END) as learningWords,
        COUNT(CASE WHEN lr.status = 'review' THEN 1 END) as reviewWords,
        COUNT(CASE WHEN lr.status = 'mastered' THEN 1 END) as masteredWords
       FROM words w
       LEFT JOIN learning_records lr ON w.id = lr.word_id AND lr.user_id = ?`,
      [userId]
    );

    const todayReview = database.get<any>(
      `SELECT COUNT(*) as count
       FROM learning_records
       WHERE user_id = ? AND next_review <= datetime('now')`,
      [userId]
    );

    return {
      totalWords: stats?.totalWords || 0,
      newWords: stats?.newWords || 0,
      learningWords: stats?.learningWords || 0,
      reviewWords: stats?.reviewWords || 0,
      masteredWords: stats?.masteredWords || 0,
      todayReview: todayReview?.count || 0,
    };
  }
}