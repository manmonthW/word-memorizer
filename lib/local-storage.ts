// 基于浏览器本地存储的简单数据库实现

export interface StoredWord {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: string;
  createdAt: string;
}

export interface StoredLearningRecord {
  id: number;
  wordId: number;
  studyCount: number;
  correctCount: number;
  lastStudied?: string;
  nextReview?: string;
  intervalDays: number;
  easeFactor: number;
  status: 'new' | 'learning' | 'review' | 'mastered';
  createdAt: string;
  updatedAt: string;
}

class LocalStorageDB {
  private isClient = typeof window !== 'undefined';

  // 获取所有单词
  getWords(): StoredWord[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem('words');
    return data ? JSON.parse(data) : [];
  }

  // 保存单词
  saveWords(words: StoredWord[]): void {
    if (!this.isClient) return;
    localStorage.setItem('words', JSON.stringify(words));
  }

  // 添加单词
  addWords(newWords: Omit<StoredWord, 'id' | 'createdAt'>[]): number {
    const existingWords = this.getWords();
    const nextId = existingWords.length > 0 ? Math.max(...existingWords.map(w => w.id)) + 1 : 1;
    
    const wordsToAdd: StoredWord[] = newWords.map((word, index) => ({
      ...word,
      id: nextId + index,
      createdAt: new Date().toISOString()
    }));

    const updatedWords = [...existingWords, ...wordsToAdd];
    this.saveWords(updatedWords);
    return wordsToAdd.length;
  }

  // 获取学习记录
  getLearningRecords(): StoredLearningRecord[] {
    if (!this.isClient) return [];
    const data = localStorage.getItem('learningRecords');
    return data ? JSON.parse(data) : [];
  }

  // 保存学习记录
  saveLearningRecords(records: StoredLearningRecord[]): void {
    if (!this.isClient) return;
    localStorage.setItem('learningRecords', JSON.stringify(records));
  }

  // 获取新单词（未学习过的）
  getNewWords(limit: number = 10): StoredWord[] {
    const words = this.getWords();
    const learningRecords = this.getLearningRecords();
    const studiedWordIds = new Set(learningRecords.map(r => r.wordId));
    
    return words
      .filter(word => !studiedWordIds.has(word.id))
      .slice(0, limit);
  }

  // 获取需要复习的单词
  getReviewWords(): (StoredWord & { learningRecord: StoredLearningRecord })[] {
    const words = this.getWords();
    const learningRecords = this.getLearningRecords();
    const now = new Date().toISOString();
    
    const reviewRecords = learningRecords.filter(record => 
      record.nextReview && record.nextReview <= now
    );

    return reviewRecords
      .map(record => {
        const word = words.find(w => w.id === record.wordId);
        return word ? { ...word, learningRecord: record } : null;
      })
      .filter(Boolean) as (StoredWord & { learningRecord: StoredLearningRecord })[];
  }

  // 更新学习记录
  updateLearningRecord(wordId: number, updates: Partial<StoredLearningRecord>): void {
    const records = this.getLearningRecords();
    const existingIndex = records.findIndex(r => r.wordId === wordId);
    
    if (existingIndex >= 0) {
      // 更新现有记录
      records[existingIndex] = {
        ...records[existingIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
    } else {
      // 创建新记录
      const nextId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
      const newRecord: StoredLearningRecord = {
        id: nextId,
        wordId,
        studyCount: 0,
        correctCount: 0,
        intervalDays: 1,
        easeFactor: 2.5,
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      };
      records.push(newRecord);
    }
    
    this.saveLearningRecords(records);
  }

  // 获取学习统计
  getStudyStats(): {
    totalWords: number;
    newWords: number;
    learningWords: number;
    reviewWords: number;
    masteredWords: number;
    todayReview: number;
  } {
    const words = this.getWords();
    const learningRecords = this.getLearningRecords();
    const studiedWordIds = new Set(learningRecords.map(r => r.wordId));
    
    const newWords = words.length - learningRecords.length;
    const learningWords = learningRecords.filter(r => r.status === 'learning').length;
    const reviewWords = learningRecords.filter(r => r.status === 'review').length;
    const masteredWords = learningRecords.filter(r => r.status === 'mastered').length;
    
    const now = new Date().toISOString();
    const todayReview = learningRecords.filter(r => 
      r.nextReview && r.nextReview <= now
    ).length;

    return {
      totalWords: words.length,
      newWords,
      learningWords,
      reviewWords,
      masteredWords,
      todayReview
    };
  }

  // 获取用户名
  getUsername(): string | null {
    if (!this.isClient) return null;
    return localStorage.getItem('username');
  }

  // 保存用户名
  saveUsername(username: string): void {
    if (!this.isClient) return;
    localStorage.setItem('username', username);
  }

  // 清空所有数据
  clearAll(): void {
    if (!this.isClient) return;
    localStorage.removeItem('words');
    localStorage.removeItem('learningRecords');
    localStorage.removeItem('username');
  }
}

export const localDB = new LocalStorageDB();