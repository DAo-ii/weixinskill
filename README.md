# 码上未来 - AI 技能包生成平台

## 项目简介

码上未来是一个为实体门店老板提供微信 AI 技能包自动生成的 SaaS 平台。用户无需编程，只需选择行业模板、填写店铺信息，即可生成可提交微信审核的 AI Skill 代码包。

## 技术栈

### 前端
- Next.js 14 + React 18
- TailwindCSS
- TypeScript

### 后端
- Python 3.11+ / FastAPI
- PostgreSQL / SQLAlchemy
- Celery + Redis
- JWT 认证

## 项目结构

```
wxskill/
├── frontend/              # Next.js 前端项目
│   ├── src/
│   │   ├── app/          # 页面
│   │   ├── components/    # 组件
│   │   └── lib/          # 工具函数
│   └── package.json
│
├── backend/               # FastAPI 后端项目
│   ├── app/
│   │   ├── api/          # API 路由
│   │   ├── core/         # 核心配置
│   │   ├── models/       # 数据库模型
│   │   ├── schemas/      # Pydantic 模型
│   │   └── tasks/        # Celery 异步任务
│   ├── templates/        # 行业模板
│   ├── requirements.txt
│   └── alembic.ini
│
└── docker-compose.yml     # 开发环境
```

## 快速开始

### 方式一：使用 Docker Compose（推荐）

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 方式二：本地开发

#### 前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入必要的配置

# 数据库迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --reload
```

访问 http://localhost:8000

API 文档：http://localhost:8000/api/docs

## 环境变量

### 后端 (.env)

```env
# 数据库
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wxskill

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI API（可选）
OPENAI_API_KEY=sk-xxx
TENCENT_CLOUD_SECRET_ID=xxx
TENCENT_CLOUD_SECRET_KEY=xxx
ZHIPUAI_API_KEY=xxx

# 文件存储
UPLOAD_DIR=./uploads
```

### 前端 (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 功能列表

### MVP 功能
- [x] 用户注册/登录
- [x] 行业模板选择
- [x] 店铺信息配置
- [x] SKILL 生成（示例）
- [x] ZIP 下载

### 规划中
- [ ] AI 动态填充变量
- [ ] wxa-skill-eval 评测集成
- [ ] 支付模块
- [ ] 团队协作

## API 文档

### 认证接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `POST /api/auth/register` | POST | 用户注册 |
| `POST /api/auth/login` | POST | 用户登录 |
| `GET /api/auth/me` | GET | 获取当前用户 |

### 项目接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `GET /api/projects` | GET | 获取项目列表 |
| `POST /api/projects` | POST | 创建项目 |
| `GET /api/projects/{id}` | GET | 获取项目详情 |
| `PUT /api/projects/{id}` | PUT | 更新项目 |
| `DELETE /api/projects/{id}` | DELETE | 删除项目 |
| `POST /api/projects/{id}/generate` | POST | 触发生成 |
| `GET /api/projects/{id}/status` | GET | 查询生成状态 |
| `GET /api/projects/{id}/download` | GET | 下载 ZIP |

### 模板接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `GET /api/templates` | GET | 获取可用模板 |

## 开发指南

### 添加新的行业模板

1. 在 `backend/templates/` 下创建新目录
2. 编写 `skill.md`、`mcp.json` 等模板文件
3. 在 `backend/app/models/template.py` 中添加模板记录

### 添加新的 API 路由

1. 在 `backend/app/api/` 下创建新的路由文件
2. 在 `backend/app/main.py` 中注册路由

## 部署

### 生产环境

建议使用 Docker Compose + Nginx 反向代理部署。

```bash
# 构建前端
cd frontend && npm run build

# 使用 Docker Compose 启动
docker-compose -f docker-compose.prod.yml up -d
```

## 许可证

MIT License

## 联系方式

- 邮箱：contact@wxskill.com
- 官网：www.wxskill.com
