# Word Memorizer - 酷炫单词记忆神器

一个基于科学记忆理论的现代化单词学习应用，专为初中男孩设计，采用游戏化界面和间隔重复算法。

## 🌟 特性

### 🧠 科学记忆算法
- **艾宾浩斯遗忘曲线**：基于记忆科学的复习时机
- **间隔重复系统 (SRS)**：智能安排复习计划
- **主动回忆**：通过测试强化记忆效果

### 🎮 游戏化体验
- **酷炫界面**：科幻风格，适合青少年审美
- **等级系统**：通过学习获得经验值和等级提升
- **成就系统**：多种成就等待解锁
- **连击系统**：连续学习获得奖励

### 📚 丰富功能
- **自定义单词本**：支持 CSV/TXT 文件上传
- **多种学习模式**：学习新词、复习模式
- **测试系统**：选择题、拼写题、填空题
- **进度追踪**：详细的学习统计和进度分析
- **发音功能**：内置语音播放

### 🎨 现代化界面
- **响应式设计**：适配各种设备
- **流畅动画**：Framer Motion 驱动的交互体验
- **暗色主题**：护眼的深色配色方案
- **粒子效果**：动态背景增强沉浸感

## 🚀 技术栈

### 前端
- **Next.js 14** - React 框架
- **Tailwind CSS** - 样式框架
- **Shadcn/ui** - 组件库
- **Framer Motion** - 动画库
- **TypeScript** - 类型安全

### 后端
- **Next.js API Routes** - 后端 API
- **SQLite** - 轻量级数据库
- **PapaParse** - CSV 文件解析

### 核心算法
- **SRS 算法** - 间隔重复系统
- **成就系统** - 游戏化奖励机制

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone <repository-url>
cd word-memorizer
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 访问应用
打开浏览器访问 `http://localhost:3000`

## 📂 项目结构

```
word-memorizer/
├── app/                    # Next.js 应用目录
│   ├── api/               # API 路由
│   │   └── words/         # 单词相关 API
│   ├── learn/             # 学习页面
│   ├── test/              # 测试页面
│   ├── upload/            # 上传页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 应用布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   └── ui/               # UI 组件库
├── database/             # 数据库相关
│   └── schema.sql        # 数据库表结构
├── lib/                  # 工具库
│   ├── database.ts       # 数据库连接
│   ├── srs.ts           # SRS 算法
│   ├── achievements.ts   # 成就系统
│   └── utils.ts         # 工具函数
├── types/               # TypeScript 类型定义
│   └── index.ts
└── utils/               # 辅助工具
```

## 🎯 核心功能详解

### 间隔重复系统 (SRS)
```typescript
// SRS 算法核心逻辑
export enum StudyRating {
  AGAIN = 1,    // 完全忘记
  HARD = 2,     // 困难
  GOOD = 3,     // 正常
  EASY = 4,     // 简单
}

// 复习间隔计算
- 初次学习：1天后复习
- 第二次：3天后复习  
- 第三次：7天后复习
- 第四次：14天后复习
- 第五次：30天后复习
```

### 数据库设计
```sql
-- 核心表结构
- words: 单词数据
- learning_records: 学习记录 (SRS核心)
- test_records: 测试记录
- user_achievements: 用户成就
- user_stats: 用户统计
- study_sessions: 学习会话
```

### 成就系统
- **连续学习**: 3天、7天、30天连续学习
- **单词掌握**: 50、100、500个单词掌握
- **完美测试**: 100%正确率测试
- **等级提升**: 等级达成奖励
- **学习时长**: 单日学习时长成就

## 🎮 使用指南

### 1. 首次使用
1. 访问首页查看学习概览
2. 点击"单词本管理"上传词汇文件
3. 选择学习模式开始学习

### 2. 单词本格式
**CSV 格式**：
```csv
word,phonetic,meaning,example,category
hello,/həˈloʊ/,你好,Hello world!,greeting
world,/wɜːrld/,世界,The world is beautiful,noun
```

**TXT 格式**：
```txt
hello	你好	/həˈloʊ/	Hello world!	greeting
world	世界	/wɜːrld/	The world is beautiful	noun
```

### 3. 学习流程
1. **学习模式**: 查看单词卡片，翻转查看释义
2. **自我评估**: 选择掌握程度（1-4级）
3. **系统调度**: SRS算法安排下次复习时间
4. **测试检验**: 通过测试巩固记忆

### 4. 测试模式
- **选择题**: 选择正确的中文释义
- **拼写题**: 根据发音拼写单词
- **填空题**: 在句子中填入正确单词

## 🎨 界面特色

### 配色方案
- **主色调**: 深蓝、紫色渐变背景
- **强调色**: 霓虹蓝 (#00bcd4)、电紫色 (#7c3aed)、荧光绿 (#00ff41)
- **警示色**: 赛博橙 (#ff6b35)

### 动画效果
- **卡片翻转**: 3D 翻转动画显示单词释义
- **按钮特效**: 悬停发光、点击涟漪效果
- **进度动画**: 流动的渐变进度条
- **粒子背景**: 动态粒子连线效果

### 响应式设计
- **移动端优化**: 触摸友好的交互设计
- **平板适配**: 中等屏幕的布局优化
- **桌面端**: 充分利用大屏幕空间

## 🔧 开发说明

### 环境要求
- Node.js 18+
- npm 或 yarn

### 开发命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint
```

### 数据库初始化
应用首次启动时会自动创建 SQLite 数据库和必要的表结构。

### 自定义配置
在 `lib/srs.ts` 中可以调整 SRS 算法参数：
```typescript
export const SRS_CONFIG = {
  INITIAL_INTERVAL: 1,        // 初始间隔(天)
  GRADUATING_INTERVAL: 1,     // 毕业间隔(天) 
  EASY_INTERVAL: 4,          // 简单间隔(天)
  MAX_INTERVAL: 365,         // 最大间隔(天)
  // ...
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn/ui](https://ui.shadcn.com/) - 组件库
- [Framer Motion](https://www.framer.com/motion/) - 动画库
- [Lucide React](https://lucide.dev/) - 图标库

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 创建 Issue
- 发送 Pull Request
- 邮件联系

---

**让学习单词变得像游戏一样有趣！** 🎮📚✨