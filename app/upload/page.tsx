'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Upload, FileText, CheckCircle, AlertCircle, BookOpen, Download } from 'lucide-react'
import Papa from 'papaparse'

interface WordData {
  word: string
  phonetic: string
  meaning: string
  example: string
  category?: string
}

export default function UploadPage() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [wordsPreview, setWordsPreview] = useState<WordData[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [totalWords, setTotalWords] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    setFileName(file.name)
    setUploadStatus('processing')
    setErrorMessage('')

    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (fileExtension === 'csv') {
      parseCSVFile(file)
    } else if (fileExtension === 'txt') {
      parseTXTFile(file)
    } else {
      setErrorMessage('不支持的文件格式。请上传 CSV 或 TXT 文件。')
      setUploadStatus('error')
    }
  }

  const parseCSVFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const words: WordData[] = results.data
            .filter((row: any) => row.word && row.meaning)
            .map((row: any) => ({
              word: row.word?.trim() || '',
              phonetic: row.phonetic?.trim() || '',
              meaning: row.meaning?.trim() || '',
              example: row.example?.trim() || '',
              category: row.category?.trim() || 'general'
            }))

          if (words.length === 0) {
            throw new Error('文件中没有找到有效的单词数据')
          }

          setWordsPreview(words.slice(0, 5)) // 预览前5个单词
          setTotalWords(words.length)
          setUploadStatus('success')
        } catch (error) {
          setErrorMessage('CSV 文件格式错误。请确保包含 word, meaning 等必需列。')
          setUploadStatus('error')
        }
      },
      error: () => {
        setErrorMessage('CSV 文件解析失败')
        setUploadStatus('error')
      }
    })
  }

  const parseTXTFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        const words: WordData[] = lines.map(line => {
          const parts = line.split('\t').map(part => part.trim())
          if (parts.length < 2) {
            throw new Error('TXT 文件格式错误')
          }
          
          return {
            word: parts[0] || '',
            phonetic: parts[2] || '',
            meaning: parts[1] || '',
            example: parts[3] || '',
            category: parts[4] || 'general'
          }
        }).filter(word => word.word && word.meaning)

        if (words.length === 0) {
          throw new Error('文件中没有找到有效的单词数据')
        }

        setWordsPreview(words.slice(0, 5))
        setTotalWords(words.length)
        setUploadStatus('success')
      } catch (error) {
        setErrorMessage('TXT 文件格式错误。每行应包含：单词[TAB]释义[TAB]音标[TAB]例句')
        setUploadStatus('error')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUploadToDatabase = async () => {
    setUploadStatus('uploading')
    setUploadProgress(0)

    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setUploadStatus('success')
          return 100
        }
        return prev + 10
      })
    }, 200)

    // TODO: 实际的数据库上传逻辑
    // await uploadWordsToDatabase(wordsPreview)
  }

  const downloadTemplate = () => {
    const csvContent = "word,phonetic,meaning,example,category\nhello,/həˈloʊ/,你好,Hello world!,greeting\nworld,/wɜːrld/,世界,The world is beautiful,noun"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'word_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-neon-blue to-neon-green bg-clip-text text-transparent">
              单词本管理
            </span>
          </h1>
          <p className="text-gray-300">
            上传你的单词本，开始个性化学习旅程
          </p>
        </div>

        {/* Upload Card */}
        <Card className="cyber-card border-neon-blue/30">
          <CardHeader>
            <CardTitle className="text-neon-blue flex items-center gap-2">
              <Upload className="w-5 h-5" />
              文件上传
            </CardTitle>
            <CardDescription>
              支持 CSV 和 TXT 格式的单词本文件
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' && (
              <div
                className="border-2 border-dashed border-neon-blue/30 rounded-lg p-8 text-center hover:border-neon-blue/60 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-neon-blue mx-auto mb-4" />
                <p className="text-gray-300 mb-2">点击或拖拽文件到此处</p>
                <p className="text-sm text-gray-500 mb-4">支持 .csv, .txt 格式，最大 10MB</p>
                <Button variant="outline" className="border-neon-blue text-neon-blue">
                  选择文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}

            {uploadStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
                <p className="text-gray-300">正在解析文件：{fileName}</p>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{errorMessage}</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadStatus('idle')
                    setFileName('')
                    setErrorMessage('')
                  }}
                >
                  重新上传
                </Button>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-neon-green mb-2">文件解析成功！</h3>
                  <p className="text-gray-300">
                    从 <span className="text-neon-blue">{fileName}</span> 中解析出 
                    <span className="text-neon-green font-bold"> {totalWords} </span> 个单词
                  </p>
                </div>

                {/* Preview */}
                <Card className="cyber-card border-neon-green/30">
                  <CardHeader>
                    <CardTitle className="text-sm text-neon-green">预览（前5个单词）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {wordsPreview.map((word, index) => (
                        <div key={index} className="bg-black/30 p-3 rounded border border-white/10">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-neon-blue">{word.word}</span>
                                {word.phonetic && (
                                  <span className="text-sm text-gray-400">{word.phonetic}</span>
                                )}
                              </div>
                              <p className="text-gray-300 text-sm mb-1">{word.meaning}</p>
                              {word.example && (
                                <p className="text-gray-500 text-xs italic">{word.example}</p>
                              )}
                            </div>
                            <span className="text-xs bg-neon-green/20 text-neon-green px-2 py-1 rounded">
                              {word.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant="neon" 
                    size="lg"
                    onClick={handleUploadToDatabase}
                    disabled={uploadStatus === 'uploading'}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    添加到词库
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setUploadStatus('idle')
                      setFileName('')
                      setWordsPreview([])
                    }}
                  >
                    重新选择
                  </Button>
                </div>
              </div>
            )}

            {uploadStatus === 'uploading' && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neon-blue mb-2">正在上传到词库...</h3>
                  <p className="text-gray-300">请稍候，正在处理 {totalWords} 个单词</p>
                </div>
                <Progress value={uploadProgress} className="h-3" />
                <p className="text-center text-sm text-gray-400">{uploadProgress}% 完成</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Download */}
        <Card className="cyber-card border-electric-purple/30">
          <CardHeader>
            <CardTitle className="text-electric-purple flex items-center gap-2">
              <FileText className="w-5 h-5" />
              模板下载
            </CardTitle>
            <CardDescription>
              下载标准格式模板，了解正确的文件格式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded border border-white/10">
                <h4 className="font-bold text-electric-purple mb-2">CSV 格式要求：</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 第一行为标题行：word, phonetic, meaning, example, category</li>
                  <li>• word（必需）：单词</li>
                  <li>• meaning（必需）：中文释义</li>
                  <li>• phonetic（可选）：音标</li>
                  <li>• example（可选）：例句</li>
                  <li>• category（可选）：分类，默认为 "general"</li>
                </ul>
              </div>
              
              <div className="bg-black/30 p-4 rounded border border-white/10">
                <h4 className="font-bold text-electric-purple mb-2">TXT 格式要求：</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 每行一个单词，使用 Tab 分隔</li>
                  <li>• 格式：单词[TAB]释义[TAB]音标[TAB]例句[TAB]分类</li>
                  <li>• 最少需要单词和释义两列</li>
                </ul>
              </div>

              <Button 
                variant="outline" 
                onClick={downloadTemplate}
                className="w-full border-electric-purple text-electric-purple hover:bg-electric-purple hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                下载 CSV 模板
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}