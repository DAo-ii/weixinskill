from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ============ User Schemas ============

class UserCreate(BaseModel):
    phone: str = Field(..., min_length=11, max_length=20)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: int
    phone: str
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# ============ Template Schemas ============

class TemplateResponse(BaseModel):
    id: str
    name: str
    icon: str
    description: Optional[str]
    features: List[str]

    class Config:
        from_attributes = True


# ============ Project Schemas ============

class ProjectStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ProductInfo(BaseModel):
    name: str
    price: str


class ProjectConfig(BaseModel):
    shop_name: str = Field(..., min_length=1)
    ai_name: Optional[str] = None
    products: List[ProductInfo] = Field(..., min_items=3)
    hours: Optional[str] = None
    discount: Optional[str] = None


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    template_id: str
    config: ProjectConfig


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[ProjectConfig] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    template_id: str
    status: ProjectStatus
    output_path: Optional[str]
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectDetailResponse(ProjectResponse):
    config: Optional[ProjectConfig] = None


# ============ Task Schemas ============

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILURE = "failure"


class GenerateRequest(BaseModel):
    pass


class GenerateResponse(BaseModel):
    task_id: str
    message: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    result: Optional[dict] = None
    error: Optional[str] = None


# ============ Common Schemas ============

class MessageResponse(BaseModel):
    message: str


class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: List
