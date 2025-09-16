import { NextRequest, NextResponse } from 'next/server'
import { Word } from '@/types'

export async function POST(request: NextRequest) {
  try {
    // 动态导入数据库
    const database = (await import('@/lib/database-new')).default;
    
    const body = await request.json()
    const { words, userId = 'default_user', wordbookName = '默认单词本' } = body

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: '单词数据不能为空' },
        { status: 400 }
      )
    }

    // 创建或获取单词本
    let wordbookId: number
    const existingWordbook = database.get(
      'SELECT id FROM wordbooks WHERE user_id = ? AND name = ?',
      [userId, wordbookName]
    )

    if (existingWordbook) {
      wordbookId = existingWordbook.id
    } else {
      const result = database.run(
        'INSERT INTO wordbooks (name, user_id, description) VALUES (?, ?, ?)',
        [wordbookName, userId, `上传于 ${new Date().toLocaleString()}`]
      )
      wordbookId = result.lastInsertRowid as number
    }

    // 批量插入单词
    let successCount = 0
    let duplicateCount = 0
    let errorCount = 0

    for (const wordData of words) {
      try {
        // 检查是否已存在
        const existing = database.get(
          'SELECT id FROM words WHERE word = ? AND wordbook_id = ?',
          [wordData.word, wordbookId]
        )

        if (existing) {
          duplicateCount++
          continue
        }

        // 插入新单词
        database.run(
          `INSERT INTO words (word, phonetic, meaning, example, category, wordbook_id, difficulty_level)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            wordData.word,
            wordData.phonetic || '',
            wordData.meaning,
            wordData.example || '',
            wordData.category || 'general',
            wordbookId,
            wordData.difficulty_level || 1
          ]
        )
        successCount++
      } catch (error) {
        console.error('Error inserting word:', wordData.word, error)
        errorCount++
      }
    }

    // 更新单词本的单词数量
    database.run(
      'UPDATE wordbooks SET total_words = (SELECT COUNT(*) FROM words WHERE wordbook_id = ?) WHERE id = ?',
      [wordbookId, wordbookId]
    )

    // 初始化或更新用户统计
    database.run(
      `INSERT OR REPLACE INTO user_stats (user_id, total_words, last_active)
       VALUES (?, (SELECT COUNT(*) FROM words w JOIN wordbooks wb ON w.wordbook_id = wb.id WHERE wb.user_id = ?), datetime('now'))`,
      [userId, userId]
    )

    return NextResponse.json({
      success: true,
      message: `成功上传 ${successCount} 个单词`,
      details: {
        successCount,
        duplicateCount,
        errorCount,
        wordbookId,
        wordbookName
      }
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取用户的单词本列表
export async function GET(request: NextRequest) {
  try {
    // 动态导入数据库
    const database = (await import('@/lib/database-new')).default;
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default_user'

    const wordbooks = database.all(
      `SELECT wb.*, COUNT(w.id) as word_count
       FROM wordbooks wb
       LEFT JOIN words w ON wb.id = w.wordbook_id
       WHERE wb.user_id = ?
       GROUP BY wb.id
       ORDER BY wb.created_at DESC`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      wordbooks
    })

  } catch (error) {
    console.error('Get wordbooks error:', error)
    return NextResponse.json(
      { error: '获取单词本列表失败' },
      { status: 500 }
    )
  }
}