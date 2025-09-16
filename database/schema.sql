-- 单词表
CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    phonetic TEXT,
    meaning TEXT NOT NULL,
    example TEXT,
    image_url TEXT,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    category TEXT DEFAULT 'general',
    wordbook_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id) ON DELETE CASCADE
);

-- 单词本表
CREATE TABLE IF NOT EXISTS wordbooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    total_words INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表 (SRS核心表)
CREATE TABLE IF NOT EXISTS learning_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    study_count INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    last_studied DATETIME,
    next_review DATETIME,
    interval_days REAL DEFAULT 1,
    ease_factor REAL DEFAULT 2.5,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'review', 'mastered')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
    UNIQUE(word_id, user_id)
);

-- 测试记录表
CREATE TABLE IF NOT EXISTS test_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('multiple_choice', 'spelling', 'fill_blank')),
    is_correct BOOLEAN NOT NULL,
    response_time_ms INTEGER,
    user_answer TEXT,
    test_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- 用户成就表
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    achievement_type TEXT NOT NULL CHECK (achievement_type IN ('daily_streak', 'words_mastered', 'perfect_test', 'level_up')),
    achievement_value INTEGER NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL UNIQUE,
    total_words INTEGER DEFAULT 0,
    words_mastered INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_study_time_minutes INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience_points INTEGER DEFAULT 0,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学习会话表
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    session_type TEXT NOT NULL CHECK (session_type IN ('learn', 'review', 'test')),
    words_studied INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    session_duration_minutes INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_learning_records_user_next_review ON learning_records(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_learning_records_status ON learning_records(status);
CREATE INDEX IF NOT EXISTS idx_test_records_user_date ON test_records(user_id, test_date);
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_wordbooks_user ON wordbooks(user_id);

-- 更新时间触发器
CREATE TRIGGER IF NOT EXISTS update_words_timestamp
    AFTER UPDATE ON words
BEGIN
    UPDATE words SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_learning_records_timestamp
    AFTER UPDATE ON learning_records
BEGIN
    UPDATE learning_records SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_user_stats_timestamp
    AFTER UPDATE ON user_stats
BEGIN
    UPDATE user_stats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;