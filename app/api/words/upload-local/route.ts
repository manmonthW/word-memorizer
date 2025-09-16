import { NextRequest, NextResponse } from 'next/server'

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