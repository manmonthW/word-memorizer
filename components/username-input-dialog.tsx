'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Sparkles } from 'lucide-react'

interface UsernameInputDialogProps {
  open: boolean
  onUsernameSubmit: (username: string) => void
}

export function UsernameInputDialog({ open, onUsernameSubmit }: UsernameInputDialogProps) {
  const [username, setUsername] = useState('')

  const handleSubmit = () => {
    if (username.trim()) {
      onUsernameSubmit(username.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-neon-blue/30 bg-black/95 backdrop-blur-md">
        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-neon-blue to-electric-purple p-1"
          >
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <User className="w-8 h-8 text-neon-blue" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-blue via-electric-purple to-neon-green bg-clip-text text-transparent">
              欢迎来到 MemCognitor Pro
            </DialogTitle>
            <DialogDescription className="text-gray-300 mt-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-neon-green" />
                请输入您的姓名，开始您的单词征服之旅
                <Sparkles className="w-4 h-4 text-neon-green" />
              </div>
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6 pt-4"
        >
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-300">
              您的姓名
            </label>
            <Input
              id="username"
              placeholder="请输入您的姓名..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-black/50 border-white/20 text-white placeholder:text-gray-500 focus:border-neon-blue focus:ring-neon-blue/30"
              autoFocus
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!username.trim()}
            className="w-full bg-gradient-to-r from-neon-blue to-electric-purple hover:from-neon-blue/80 hover:to-electric-purple/80 text-white font-bold py-3 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4" />
              开始学习之旅
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </Button>

          <p className="text-xs text-gray-500 text-center">
            基于艾宾浩斯遗忘曲线的科学记忆系统
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}