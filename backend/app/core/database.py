"""
数据库连接和 session 管理

所有路由通过 Depends(get_db) 获取数据库 session。
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Configure engine based on database type
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    FastAPI 依赖注入用的数据库 session 生成器。
    所有路由通过 Depends(get_db) 使用此函数。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
