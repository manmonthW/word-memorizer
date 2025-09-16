import { NextRequest, NextResponse } from 'next/server'

// 这个 API 路由现在只是为了兼容性，实际存储在客户端进行
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { words } = body

    if (!words || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: '单词数据不能为空' },
        { status: 400 }
      )
    }

    // 返回成功响应，实际存储在客户端进行
    return NextResponse.json({
      success: true,
      message: `成功接收 ${words.length} 个单词`,
      wordsCount: words.length
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: '服务器错误，请稍后重试' },
      { status: 500 }
    )
  }
}

// 获取用户的单词本列表（现在返回空数组，因为使用本地存储）
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      wordbooks: []
    })
  } catch (error) {
    console.error('Get wordbooks error:', error)
    return NextResponse.json(
      { error: '获取单词本列表失败' },
      { status: 500 }
    )
  }
}