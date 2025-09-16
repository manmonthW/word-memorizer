import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// 数据库连接类
class Database {
  private db: sqlite3.Database | null = null;
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private async init() {
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

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.setupDatabase();
      }
    });

    this.isInitialized = true;
  }

  private async setupDatabase() {
    if (!this.db) return;

    try {
      const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
      let schema: string;
      
      try {
        schema = fs.readFileSync(schemaPath, 'utf8');
      } catch (error) {
        // 如果无法读取文件，使用内联SQL
        schema = `
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
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          
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
        `;
      }

      // 分割SQL语句并执行
      const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        await this.run(statement);
      }
    } catch (error) {
      console.error('Error setting up database:', error);
    }
  }

  // Promise化的数据库操作方法
  async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row as T);
      });
    });
  }

  async all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  }

  async close(): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      this.db!.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// 单例数据库实例
const database = new Database();

export default database;