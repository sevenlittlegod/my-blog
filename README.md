# My Blog

基于 Next.js 16 构建的个人博客，支持 Markdown 写作、评论系统、标签分类、全文搜索、RSS 订阅、暗色模式。

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Next.js 16 (App Router) + TypeScript |
| 样式 | Tailwind CSS v4 |
| 数据库 | PostgreSQL + Prisma 7 |
| 认证 | Auth.js v5 (Credentials Provider) |
| 内容 | react-markdown + @uiw/react-md-editor |
| 暗色模式 | next-themes |
| 部署 | 自建服务器（宝塔面板 + PM2） |

## 功能

- **Markdown 编辑器** — 所见即所得的 Markdown 写作体验，支持实时预览
- **标签系统** — 文章分类与标签云，按标签筛选文章
- **评论系统** — 支持嵌套回复，管理员审核后展示
- **全文搜索** — 基于 SQL 的文章搜索
- **RSS 订阅** — `/rss.xml` 自动生成 RSS Feed
- **暗色模式** — 跟随系统 / 手动切换
- **页面统计** — 内建页面浏览追踪与分析面板
- **响应式设计** — 适配移动端与桌面端

## 项目结构

```
src/
├── auth.ts                   # Auth.js v5 认证配置
├── proxy.ts                  # 路由保护（/admin 需登录）
├── lib/
│   ├── prisma.ts             # Prisma 7 客户端
│   └── auth-utils.ts         # 密码哈希与验证
├── providers/
│   └── ThemeProvider.tsx     # 暗色模式 Provider
├── components/
│   ├── Header.tsx            # 导航栏 + 暗色模式切换
│   ├── Footer.tsx            # 页脚
│   ├── PostCard.tsx          # 文章卡片
│   ├── MarkdownRenderer.tsx  # Markdown 渲染组件
│   └── CommentSection.tsx    # 评论组件（嵌套回复）
├── app/
│   ├── page.tsx              # 首页（最新文章 + 标签云）
│   ├── posts/[slug]/         # 文章详情页
│   ├── tags/                 # 标签列表 & 过滤
│   ├── search/               # 搜索页
│   ├── about/                # 关于页
│   ├── rss.xml/              # RSS 订阅源
│   ├── admin/                # 后台管理
│   │   ├── login/            # 登录页
│   │   ├── posts/new/        # 新建 / 编辑文章
│   │   └── comments/         # 评论审核
│   └── api/                  # REST API
│       ├── posts/            # 文章 CRUD
│       ├── tags/             # 标签管理
│       ├── search/           # 全文搜索
│       ├── comments/         # 评论提交与审核
│       └── analytics/        # 页面浏览追踪
└── generated/prisma/         # Prisma 生成的客户端
```

---

## 本地开发

### 前置条件

- Node.js 18+
- PostgreSQL（本地安装或 Docker）

### 安装与启动

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量文件并编辑
cp .env.example .env
# 编辑 .env，填入本地 PostgreSQL 连接信息
# DATABASE_URL="postgresql://user:password@localhost:5432/myblog?schema=public"

# 3. 运行数据库迁移
npx prisma migrate dev --name init

# 4. 创建管理员账号
npx tsx scripts/seed.ts

# 5. 启动开发服务器
npm run dev
```

默认管理员账号：`admin@example.com` / `admin123`

可通过 `.env` 文件修改：

```
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=yourpassword
ADMIN_NAME=Your Name
```

---

## 部署到生产环境

> 此项目部署到自建 Linux 服务器，使用宝塔面板管理 Nginx 反向代理 + PM2 守护进程，数据库使用服务器本地 PostgreSQL。

### 第一步：服务器环境准备

```bash
# 安装 Node.js 20（推荐使用 nvm）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20

# 安装 PM2
npm install -g pm2

# 安装 tsx（用于运行 seed 脚本）
npm install -g tsx
```

### 第二步：宝塔面板配置

#### 2a. 创建数据库

1. 宝塔面板 → **数据库** → **添加数据库**
2. 填写数据库名（如 `myblog`）、用户名、密码
3. 记下连接信息，格式：`postgresql://用户名:密码@localhost:5432/数据库名`

#### 2b. 创建网站 + 反向代理

1. 宝塔面板 → **网站** → **添加站点**，填入你的域名
2. 进入网站 **设置 → 反向代理**
3. 目标 URL：`http://127.0.0.1:3000`
4. 保存

### 第三步：首次部署

```bash
# SSH 到服务器
ssh root@你的服务器IP

# 克隆项目
mkdir -p /www/wwwroot/my-blog
cd /www/wwwroot/my-blog
git clone https://github.com/你的用户名/my-blog.git .

# 创建 .env 文件
cat > .env << 'EOF'
DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名"
AUTH_SECRET="<运行 node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 生成>"
AUTH_URL="https://你的域名"
EOF

# 安装依赖 + 生成 Prisma Client
npm ci
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 创建管理员账号
npx tsx scripts/seed.ts

# 构建并启动
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # 设置开机自启
```

### 第四步：配置 GitHub Actions 自动部署

项目已包含 GitHub Actions 工作流（`.github/workflows/deploy.yml`），每次推送到 `main` 分支自动：

1. 安装依赖 + 生成 Prisma Client
2. 运行数据库迁移
3. 构建 Next.js 应用
4. SSH 部署到服务器
5. PM2 重启应用

在 GitHub 仓库中，进入 **Settings → Secrets and variables → Actions**，添加以下 Secrets：

| Secret | 说明 |
|---|---|
| `SSH_HOST` | 服务器 IP 地址 |
| `SSH_USER` | SSH 用户名（通常是 root） |
| `SSH_KEY` | SSH 私钥内容（`cat ~/.ssh/id_rsa`） |
| `SSH_TARGET` | 项目路径，如 `/www/wwwroot/my-blog` |
| `DATABASE_URL` | PostgreSQL 连接字符串 |
| `AUTH_SECRET` | 32 字节随机密钥 |
| `AUTH_URL` | `https://你的域名` |

配置完成后，每次 `git push` 到 `main` 分支即可自动部署。

### 第五步：SSL 证书

1. 宝塔面板 → **网站** → 点击你的站点
2. **SSL → Let's Encrypt** → 申请证书
3. 勾选"强制 HTTPS"

### 第六步：首次登录

1. 打开 `https://你的域名`
2. 访问 `/admin/login`，使用管理员账号登录
3. 开始写文章！

### 后续更新流程

```bash
# 本地开发完成后推送，GitHub Actions 自动部署
git add .
git commit -m "your message"
git push

# 如果需要变更数据库 schema：
npx prisma migrate dev --name describe_your_change
git add prisma/migrations
git commit -m "db migration: describe_your_change"
git push
```
