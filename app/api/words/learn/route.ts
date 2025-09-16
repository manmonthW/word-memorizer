import { NextRequest, NextResponse } from 'next/server'
// import { SRSAlgorithm } from '@/lib/srs'

// 获取学习单词（新单词 + 复习单词）
export async function GET(request: NextRequest) {
  try {
    // 动态导入 SRS 算法
    const { SRSAlgorithm } = await import('@/lib/srs')
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'default_user'
    const mode = searchParams.get('mode') || 'mixed' // 'new', 'review', 'mixed'
    const limit = parseInt(searchParams.get('limit') || '10')

    let words = []

    if (mode === 'new') {
      // 只获取新单词
      words = await SRSAlgorithm.getNewWords(userId, limit)
    } else if (mode === 'review') {
      // 只获取复习单词
      words = await SRSAlgorithm.getTodayReviewWords(userId)
    } else {
      // 混合模式：优先复习，然后新单词
      const reviewWords = await SRSAlgorithm.getTodayReviewWords(userId)
      const remainingSlots = Math.max(0, limit - reviewWords.length)
      const newWords = remainingSlots > 0 ? await SRSAlgorithm.getNewWords(userId, remainingSlots) : []
      
      words = [...reviewWords, ...newWords]
    }

    // 为每个单词添加学习状态信息
    const wordsWithStatus = words.map(word => ({
      ...word,
      isNew: !word.last_studied,
      nextReview: word.next_review,
      studyCount: word.study_count || 0
    }))

    return NextResponse.json({
      success: true,
      words: wordsWithStatus,
      stats: {
        total: words.length,
        new: words.filter(w => !w.last_studied).length,
        review: words.filter(w => w.last_studied).length
      }
    })

  } catch (error) {
    console.error('Get learning words error:', error)
    return NextResponse.json(
      { error: '获取学习单词失败' },
      { status: 500 }
    )
  }
}

// 更新学习记录
export async function POST(request: NextRequest) {
  try {
    // 动态导入 SRS 算法
    const { SRSAlgorithm } = await import('@/lib/srs')
    
    const body = await request.json()
    const { userId = 'default_user', wordId, rating } = body

    if (!wordId || rating === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 更新学习记录
    await SRSAlgorithm.updateLearningRecord(userId, wordId, rating)

    // 获取更新后的统计信息
    const stats = await SRSAlgorithm.getStudyStats(userId)

    return NextResponse.json({
      success: true,
      message: '学习记录更新成功',
      stats
    })

  } catch (error) {
    console.error('Update learning record error:', error)
    return NextResponse.json(
      { error: '更新学习记录失败' },
      { status: 500 }
    )
  }
}