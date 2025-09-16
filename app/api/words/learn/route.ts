import { NextRequest, NextResponse } from 'next/server'

// 这个 API 路由现在只是为了兼容性，实际数据处理在客户端进行
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      words: [],
      stats: {
        total: 0,
        new: 0,
        review: 0
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

// 更新学习记录（现在只返回成功响应，实际更新在客户端进行）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wordId, rating } = body

    if (!wordId || rating === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '学习记录更新成功',
      stats: {
        totalWords: 0,
        newWords: 0,
        reviewWords: 0,
        masteredWords: 0
      }
    })

  } catch (error) {
    console.error('Update learning record error:', error)
    return NextResponse.json(
      { error: '更新学习记录失败' },
      { status: 500 }
    )
  }
}