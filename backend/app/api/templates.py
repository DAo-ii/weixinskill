from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.security import get_current_user
from app.core.database import get_db
from app.models import Template
from app.schemas import TemplateResponse
import json

router = APIRouter(prefix="/templates", tags=["模板"])


@router.get("", response_model=List[TemplateResponse])
def get_templates(db: Session = Depends(get_db)):
    """获取所有可用的行业模板"""
    templates = db.query(Template).filter(Template.is_active == 1).all()

    result = []
    for t in templates:
        features = json.loads(t.features) if t.features else []
        result.append(TemplateResponse(
            id=t.id,
            name=t.name,
            icon=t.icon or "📦",
            description=t.description,
            features=features
        ))

    return result


@router.get("/{template_id}", response_model=TemplateResponse)
def get_template(template_id: str, db: Session = Depends(get_db)):
    """获取指定模板详情"""
    template = db.query(Template).filter(
        Template.id == template_id,
        Template.is_active == 1
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="模板不存在")

    features = json.loads(template.features) if template.features else []
    return TemplateResponse(
        id=template.id,
        name=template.name,
        icon=template.icon or "📦",
        description=template.description,
        features=features
    )
