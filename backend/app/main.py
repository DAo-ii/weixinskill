from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging_config import setup_logging, get_logger
from app.core.database import SessionLocal, engine
from app.models import Base
from app.api import auth, projects, templates

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logging()
    logger.info("应用启动中...")

    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    logger.info("数据库表已就绪")

    # Seed default templates and demo user
    seed_templates()
    seed_demo_user()

    yield
    # Shutdown
    logger.info("应用关闭")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="实体门店的微信 AI 技能包自动化生成器 API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


def seed_templates():
    """Seed default templates to database"""
    from app.models import Template
    import json

    db = SessionLocal()
    try:
        existing = db.query(Template).first()
        if existing:
            return

        default_templates = [
            {
                "id": "milk-tea",
                "name": "奶茶店",
                "icon": "🧋",
                "description": "适合奶茶、果茶、咖啡等饮品店",
                "features": json.dumps(["点餐下单", "产品推荐", "优惠活动"]),
                "template_path": "templates/milk_tea_shop",
                "is_active": 1,
            },
            {
                "id": "fast-food",
                "name": "快餐店",
                "icon": "🍔",
                "description": "适合汉堡、炸鸡、披萨等快餐店",
                "features": json.dumps(["快速点餐", "套餐推荐", "外卖对接"]),
                "template_path": "templates/fast_food_shop",
                "is_active": 1,
            },
            {
                "id": "convenience",
                "name": "便利店",
                "icon": "🏪",
                "description": "适合便利店、超市、小卖部",
                "features": json.dumps(["商品查询", "库存提醒", "促销通知"]),
                "template_path": "templates/convenience_store",
                "is_active": 1,
            },
        ]

        for template_data in default_templates:
            template = Template(**template_data)
            db.add(template)

        db.commit()
        logger.info("已初始化默认模板数据")
    except Exception as e:
        db.rollback()
        logger.error(f"初始化模板失败: {e}")
    finally:
        db.close()


def seed_demo_user():
    """如果没有用户，创建演示账号"""
    from app.models import User
    from app.core.security import get_password_hash

    db = SessionLocal()
    try:
        if db.query(User).first():
            return

        demo_user = User(
            phone="13800138000",
            hashed_password=get_password_hash("123456")
        )
        db.add(demo_user)
        db.commit()
        logger.info("已创建演示账号: 13800138000")
    except Exception as e:
        db.rollback()
        logger.error(f"创建演示账号失败: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
