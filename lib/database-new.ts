import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 数据库连接类
class DatabaseManager {
  private db: Database.Database | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized) return;

    // 在生产环境中使用内存数据库，在开发环境中使用文件数据库
    const isProduction = process.env.NODE_ENV === 'production';
    const dbPath = isProduction ? ':memory:' : path.join(process.cwd(), 'database', 'app.db');
    
    if (!isProduction) {
      const dbDir = path.dirname(dbPath);
      // 确保数据库目录存在
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
    }

    try {
      this.db = new Database(dbPath);
      console.log('Connected to SQLite database');
      this.setupDatabase();
      this.isInitialized = true;
    } catch (error) {
      console.error('Error opening database:', error);
    }
  }

  private setupDatabase() {
    if (!this.db) return;

    try {
      // 内联 SQL schema
      const schema = `
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
        
        CREATE TABLE IF NOT EXISTS words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word TEXT NOT NULL,
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

        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            achievement_type TEXT NOT NULL,
            achievement_value INTEGER NOT NULL,
            unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_learning_records_user_next_review ON learning_records(user_id, next_review);
        CREATE INDEX IF NOT EXISTS idx_learning_records_status ON learning_records(status);
        CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
        CREATE INDEX IF NOT EXISTS idx_wordbooks_user ON wordbooks(user_id);
      `;

      // 分割SQL语句并执行
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        this.db.exec(statement);
      }
    } catch (error) {
      console.error('Error setting up database:', error);
    }
  }

  // 数据库操作方法
  run(sql: string, params: any[] = []): Database.RunResult {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql);
    return stmt.run(params);
  }

  get<T = any>(sql: string, params: any[] = []): T | undefined {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql);
    return stmt.get(params) as T;
  }

  all<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare(sql);
    return stmt.all(params) as T[];
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// 单例数据库实例
const database = new DatabaseManager();

export default database;