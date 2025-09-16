# 🚀 部署指南

本指南将帮助你将 Word Memorizer 应用部署到网络上，让你可以通过互联网访问。

## 方案一：Vercel 部署（推荐）⭐

Vercel 是 Next.js 的官方部署平台，免费且简单易用。

### 步骤 1：准备 GitHub 仓库

1. **创建 GitHub 账户**（如果没有的话）
   - 访问 [github.com](https://github.com) 注册账户

2. **创建新的仓库**
   - 登录 GitHub，点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称：`word-memorizer`
   - 设置为 Public（公开）
   - 不要勾选任何初始化选项
   - 点击 "Create repository"

3. **上传项目代码**
   ```bash
   # 在项目目录中初始化 Git
   cd word-memorizer
   git init
   
   # 添加所有文件
   git add .
   
   # 提交代码
   git commit -m "Initial commit: Word Memorizer app"
   
   # 连接到你的 GitHub 仓库（替换为你的用户名）
   git remote add origin https://github.com/YOUR_USERNAME/word-memorizer.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

### 步骤 2：Vercel 部署

1. **创建 Vercel 账户**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 使用 GitHub 账户登录

2. **导入项目**
   - 在 Vercel 控制台，点击 "New Project"
   - 选择你刚创建的 `word-memorizer` 仓库
   - 点击 "Import"

3. **配置部署设置**
   - Framework Preset: 自动检测为 "Next.js"
   - Root Directory: `./` (默认)
   - Build and Output Settings: 保持默认
   - 点击 "Deploy"

4. **等待部署完成**
   - 部署过程大约需要 2-3 分钟
   - 完成后会显示部署成功页面和访问链接

### 步骤 3：访问你的应用

部署成功后，你会得到一个类似这样的链接：
```
https://word-memorizer-xyz123.vercel.app
```

## 方案二：Netlify 部署

### 步骤 1：准备代码

1. 确保项目已上传到 GitHub（参考方案一的步骤1）

### 步骤 2：Netlify 部署

1. **创建 Netlify 账户**
   - 访问 [netlify.com](https://netlify.com)
   - 使用 GitHub 账户注册登录

2. **导入项目**
   - 点击 "New site from Git"
   - 选择 "GitHub"
   - 授权并选择 `word-memorizer` 仓库

3. **配置构建设置**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - 点击 "Deploy site"

## 方案三：自己的服务器部署

如果你有自己的服务器（VPS），可以按以下步骤部署：

### 1. 服务器环境准备
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2（进程管理器）
npm install -g pm2
```

### 2. 部署代码
```bash
# 克隆代码
git clone https://github.com/YOUR_USERNAME/word-memorizer.git
cd word-memorizer

# 安装依赖
npm install

# 构建项目
npm run build

# 使用 PM2 启动
pm2 start npm --name "word-memorizer" -- start
pm2 save
pm2 startup
```

### 3. 配置反向代理（Nginx）
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📱 移动端优化

应用已经完全响应式设计，在手机上访问体验良好：

- **PWA 支持**：可以添加到手机主屏幕
- **触摸优化**：适合手机操作的交互设计
- **离线缓存**：部分功能支持离线使用

## 🔧 部署后配置

### 环境变量设置

在 Vercel 控制台的 Settings → Environment Variables 中添加：

```bash
NODE_ENV=production
DATABASE_URL=your_database_url_if_needed
```

### 域名绑定（可选）

1. **购买域名**（如 GoDaddy、阿里云等）
2. **在 Vercel 中添加域名**
   - 进入项目设置 → Domains
   - 添加你的域名
   - 按照提示配置 DNS 记录

### SSL 证书

Vercel 自动提供免费的 SSL 证书，你的网站将通过 HTTPS 访问。

## 🚨 注意事项

### 数据持久化

由于使用的是 SQLite 内存数据库（生产环境），数据在应用重启后会丢失。如需数据持久化，建议：

1. **升级到 PostgreSQL**：使用 Vercel Postgres 或其他云数据库
2. **使用云存储**：将用户数据存储到云端
3. **本地存储**：使用浏览器 localStorage 存储用户进度

### 性能优化

- ✅ 已启用 Next.js 自动优化
- ✅ 已配置 Tailwind CSS 生产构建优化
- ✅ 已启用 Framer Motion 懒加载
- ✅ 已优化图片和字体加载

## 🎉 部署完成

恭喜！你的单词记忆应用现在已经可以通过互联网访问了。

### 分享你的应用

你可以将部署链接分享给朋友：
```
🎮 我的单词记忆神器上线了！
🔗 https://your-app-name.vercel.app
📚 科学记忆算法 + 游戏化界面
🎯 让学单词变得像玩游戏一样有趣！
```

### 后续维护

- **代码更新**：推送到 GitHub 后 Vercel 会自动重新部署
- **监控使用情况**：在 Vercel 控制台查看访问统计
- **功能迭代**：根据用户反馈持续改进应用

## 🔗 有用的链接

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [GitHub 使用教程](https://docs.github.com/en/get-started)

---

**祝你的单词记忆应用部署顺利！** 🚀✨