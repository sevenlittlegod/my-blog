# My Blog

这是一个基于 Next.js 16 App Router 的个人博客，支持 Markdown 写作、文章标签、评论审核、全文搜索、RSS、暗色模式、后台管理和访问统计。

本项目按“低配服务器友好”的方式部署：**GitHub Actions 负责安装依赖和构建，2 核 2G 服务器只负责运行构建好的 standalone 产物**。这样可以绕开服务器上 `npm install`、`next build` 卡死的问题。

## 技术栈

| 类别 | 技术 |
|---|---|
| 前端框架 | Next.js 16 + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 |
| 数据库 | PostgreSQL + Prisma 7 |
| 认证 | Auth.js v5 |
| 内容 | Markdown + `react-markdown` + `@uiw/react-md-editor` |
| 进程管理 | PM2 |
| 部署 | GitHub Actions + Next standalone + Nginx 反向代理 |

## 为什么不能直接在 2C2G 服务器上构建

Next.js 生产构建会同时做编译、类型检查、压缩、路由分析和依赖追踪，Prisma、Tailwind、React 这些依赖也会增加内存压力。2 核 2G 的机器可以跑这个博客，但不适合承担完整构建流程。

推荐部署链路是：

```text
本地写代码
  -> push 到 GitHub main 分支
  -> GitHub Actions 安装依赖、生成 Prisma Client、迁移数据库、构建 Next
  -> 打包 .next/standalone
  -> 通过 SSH 上传到服务器
  -> PM2 重启 server.js
  -> Nginx 反向代理到 127.0.0.1:3000
```

服务器上不需要执行：

```bash
npm install
npm ci
npm run build
```

## 本地开发

### 1. 准备环境

本地建议使用：

- Node.js 20.9 或更高版本
- PostgreSQL
- npm

Next.js 16 要求 Node.js 至少为 `20.9.0`。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

在项目根目录创建 `.env`：

```env
DATABASE_URL="postgresql://postgres:your_password@127.0.0.1:5432/my_blog"
AUTH_SECRET="replace-with-a-random-secret"
AUTH_URL="http://localhost:3000"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"
ADMIN_NAME="Admin"
```

生成 `AUTH_SECRET` 可以用：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 初始化数据库

```bash
npx prisma migrate dev
npm run db:seed
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问：

- 前台：`http://localhost:3000`
- 后台登录：`http://localhost:3000/admin/login`

默认管理员账号取决于 `.env` 里的 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD`。

## 服务器首次准备

下面以宝塔面板 + Ubuntu/Debian 类 Linux 服务器为例。其他 Linux 环境也类似。

### 1. 安装 Node.js 20

推荐使用 nvm：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v
```

确认版本至少是 `v20.9.0`。

### 2. 安装 PM2

服务器只需要 PM2 来守护 Node 进程：

```bash
npm install -g pm2
```

### 3. 准备部署目录

示例目录：

```bash
mkdir -p /www/wwwroot/my-blog
cd /www/wwwroot/my-blog
```

后续 GitHub Actions 会把 standalone 产物上传到这个目录。

### 4. 创建 PostgreSQL 数据库

在宝塔面板里创建 PostgreSQL 数据库，记下：

- 数据库名
- 用户名
- 密码
- 端口，通常是 `5432`

假设数据库信息如下：

```text
数据库名：my_blog
用户名：my_blog_user
密码：your_db_password
地址：127.0.0.1
端口：5432
```

### 5. 在服务器部署目录创建 `.env`

进入部署目录：

```bash
cd /www/wwwroot/my-blog
```

创建 `.env`：

```bash
cat > .env << 'EOF'
DATABASE_URL="postgresql://my_blog_user:your_db_password@127.0.0.1:5432/my_blog"
AUTH_SECRET="replace-with-a-random-secret"
AUTH_URL="https://your-domain.com"

ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
ADMIN_NAME="Admin"
EOF
```

注意：

- 服务器 `.env` 里的数据库地址用 `127.0.0.1:5432`。
- `AUTH_URL` 改成你的正式域名。
- `.env` 不要提交到 Git。
- GitHub Actions 上传文件时会排除 `.env`，不会覆盖服务器上的生产环境变量。

## GitHub Actions 自动部署

项目已经包含 `.github/workflows/deploy.yml`。推送到 `main` 分支后会自动部署。

### 自动部署会做什么

每次 push 到 `main` 后，Actions 会：

1. 拉取代码。
2. 安装 Node.js 20。
3. 通过 SSH 隧道连接服务器本机 PostgreSQL。
4. 执行 `npm ci`。
5. 执行 `npx prisma generate`。
6. 执行 `npx prisma migrate deploy`。
7. 执行 `npm run build`。
8. 执行 `npm run package:standalone`。
9. 上传 `.next/standalone` 到服务器。
10. 用 PM2 reload 或 start 应用。

重点：服务器不会执行 `npm ci`，也不会执行 `npm run build`。

### 需要配置的 GitHub Secrets

进入 GitHub 仓库：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

添加这些 secrets：

| Secret | 示例 | 说明 |
|---|---|---|
| `SSH_HOST` | `1.2.3.4` | 服务器 IP |
| `SSH_USER` | `root` | SSH 用户 |
| `SSH_KEY` | 私钥全文 | 用于登录服务器的 SSH 私钥 |
| `SSH_TARGET` | `/www/wwwroot/my-blog` | 服务器部署目录 |
| `DATABASE_URL` | `postgresql://my_blog_user:your_db_password@127.0.0.1:5433/my_blog` | Actions 里通过 SSH 隧道访问数据库 |
| `AUTH_SECRET` | 随机 32 字节字符串 | Auth.js 密钥 |
| `AUTH_URL` | `https://your-domain.com` | 正式站点地址 |

这里最容易填错的是 `DATABASE_URL`。

服务器 `.env` 用：

```env
DATABASE_URL="postgresql://my_blog_user:your_db_password@127.0.0.1:5432/my_blog"
```

GitHub Secret 里的 `DATABASE_URL` 用：

```env
postgresql://my_blog_user:your_db_password@127.0.0.1:5433/my_blog
```

原因是 Actions 不是在服务器上运行的。workflow 会打开一个 SSH 隧道，把 GitHub Runner 的 `127.0.0.1:5433` 转发到服务器的 `127.0.0.1:5432`。

### SSH 私钥怎么准备

如果你本机还没有 SSH key，可以生成一个：

```bash
ssh-keygen -t ed25519 -C "github-actions-my-blog"
```

把公钥加入服务器：

```bash
ssh-copy-id root@your-server-ip
```

或者手动把 `.pub` 文件内容追加到服务器的：

```bash
~/.ssh/authorized_keys
```

把私钥内容填到 GitHub Secret `SSH_KEY`。私钥通常类似：

```text
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

不要把私钥提交到仓库。

## 首次部署流程

### 1. 确认服务器目录和 `.env`

服务器上确认：

```bash
cd /www/wwwroot/my-blog
ls -la
cat .env
```

确认 `.env` 里有：

```env
DATABASE_URL="postgresql://...@127.0.0.1:5432/..."
AUTH_SECRET="..."
AUTH_URL="https://your-domain.com"
```

### 2. 推送代码到 main

本地执行：

```bash
git add .
git commit -m "deploy with standalone"
git push origin main
```

然后到 GitHub 仓库的 Actions 页面查看部署日志。

### 3. 部署成功后检查服务器文件

服务器上应该能看到：

```bash
cd /www/wwwroot/my-blog
ls
```

关键文件包括：

```text
server.js
.next/
public/
node_modules/
ecosystem.config.js
.env
```

这里的 `node_modules` 是 Next standalone 自动追踪出来的最小运行依赖，不是服务器上 `npm install` 生成的完整依赖。

### 4. 检查 PM2 状态

```bash
pm2 list
pm2 logs my-blog
```

如果没有启动，可以手动启动一次：

```bash
cd /www/wwwroot/my-blog
pm2 start ecosystem.config.js
pm2 save
```

设置开机自启：

```bash
pm2 startup
```

按照命令输出的提示再执行一次即可。

### 5. 本机端口检查

服务器上执行：

```bash
curl http://127.0.0.1:3000
```

如果能返回 HTML，说明 Next 应用已经跑起来。

## Nginx 反向代理

在宝塔面板中：

1. 添加站点，绑定你的域名。
2. 进入站点设置。
3. 配置反向代理。
4. 目标 URL 填：

```text
http://127.0.0.1:3000
```

也可以手写 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

SSL 证书可以在宝塔面板里用 Let's Encrypt 申请。申请后建议开启强制 HTTPS。

## 后续更新流程

日常开发只需要：

```bash
git add .
git commit -m "update blog"
git push origin main
```

然后等 GitHub Actions 自动部署完成。

如果修改了 Prisma schema：

```bash
npx prisma migrate dev --name describe_your_change
git add prisma
git commit -m "db migration: describe your change"
git push origin main
```

Actions 会通过 SSH 隧道执行：

```bash
npx prisma migrate deploy
```

数据库仍然只监听服务器本机，不需要暴露公网。

## 手动部署备用方案

如果 GitHub Actions 暂时不可用，也可以在本地或一台内存更大的机器上构建，然后上传。

本地构建：

```bash
npm ci
npm run build
npm run package:standalone
```

上传 `.next/standalone` 里的内容到服务器部署目录：

```bash
rsync -avz --delete .next/standalone/ root@your-server-ip:/www/wwwroot/my-blog/
rsync -avz ecosystem.config.js root@your-server-ip:/www/wwwroot/my-blog/ecosystem.config.js
```

服务器重启：

```bash
cd /www/wwwroot/my-blog
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
pm2 save
```

## 常见问题

### 1. GitHub Actions 里数据库连接失败

如果看到类似 `P1001 Can't reach database server`，优先检查 GitHub Secret `DATABASE_URL`。

Actions 里应该是：

```env
postgresql://用户名:密码@127.0.0.1:5433/数据库名
```

不是 `5432`。

还要确认服务器 PostgreSQL 正在监听 `127.0.0.1:5432`。

### 2. GitHub Actions 里 SSH tunnel 失败

检查：

- `SSH_HOST` 是否是正确服务器 IP。
- `SSH_USER` 是否能 SSH 登录。
- `SSH_KEY` 是否是私钥全文。
- 服务器 `~/.ssh/authorized_keys` 是否包含对应公钥。
- 服务器安全组或防火墙是否允许 22 端口。

### 3. PM2 日志显示找不到 `server.js`

说明 standalone 产物没有正确上传。检查 Actions 里这两步是否成功：

```bash
npm run build
npm run package:standalone
```

服务器部署目录里应该直接存在：

```text
/www/wwwroot/my-blog/server.js
```

### 4. 网站 502 Bad Gateway

按顺序检查：

```bash
pm2 list
pm2 logs my-blog
curl http://127.0.0.1:3000
```

如果 `curl` 不通，先修 PM2 或环境变量。如果 `curl` 通但域名不通，检查 Nginx 反向代理。

### 5. 登录失败或回调地址不对

检查服务器 `.env`：

```env
AUTH_URL="https://your-domain.com"
AUTH_SECRET="..."
```

修改后重启：

```bash
pm2 reload my-blog
```

### 6. 服务器内存还是紧张

当前 PM2 配置设置了：

```js
max_memory_restart: "450M"
```

如果你的访问量很小但仍然重启频繁，可以查看：

```bash
pm2 monit
pm2 logs my-blog
free -h
```

确认服务器上没有同时跑其他高内存服务。这个项目的构建已经不在服务器上执行，正常访问量下 2C2G 是有机会稳定运行的。

## 相关脚本

| 命令 | 说明 |
|---|---|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run package:standalone` | 把 `public` 和 `.next/static` 复制进 standalone 包 |
| `npm run start` | 使用 `next start` 启动，主要用于非 standalone 场景 |
| `npm run db:migrate` | 执行 `prisma migrate deploy` |
| `npm run db:seed` | 创建管理员账号或种子数据 |

## 部署后的目录结构

服务器部署目录大致如下：

```text
/www/wwwroot/my-blog/
├── .env
├── server.js
├── ecosystem.config.js
├── package.json
├── public/
├── .next/
│   └── static/
└── node_modules/
```

这是 Next standalone 的运行目录。不要在这里执行 `npm install`，也不要把它当作完整源码目录使用。
