from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import json
import os
from datetime import datetime, timezone

from app.core.security import get_current_user
from app.core.config import settings
from app.core.logging_config import get_logger
from app.core.database import get_db
from app.models import Project, ProjectStatus as DBProjectStatus, Task
from app.schemas import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectDetailResponse,
    ProjectStatus, GenerateResponse, TaskStatusResponse, TaskStatus
)
from app.tasks.generate_skill import generate_skill_sync

logger = get_logger(__name__)
router = APIRouter(prefix="/projects", tags=["项目"])


@router.get("", response_model=List[ProjectResponse])
def get_projects(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的所有项目"""
    projects = db.query(Project).filter(
        Project.user_id == int(current_user["user_id"])
    ).order_by(Project.created_at.desc()).all()

    return projects


@router.post("", response_model=ProjectResponse)
def create_project(
    project_data: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新项目"""
    # Create project
    new_project = Project(
        user_id=int(current_user["user_id"]),
        name=project_data.name,
        template_id=project_data.template_id,
        config_json=project_data.config.model_dump_json(),
        status=DBProjectStatus.PENDING
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目详情"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    if project_data.name:
        project.name = project_data.name
    if project_data.config:
        project.config_json = project_data.config.model_dump_json()

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    db.delete(project)
    db.commit()

    return {"message": "项目已删除"}


@router.post("/{project_id}/generate", response_model=GenerateResponse)
def trigger_generate(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """触发生成 AI 技能包（同步执行，无需 Redis/Celery）"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    if project.status == DBProjectStatus.GENERATING:
        raise HTTPException(status_code=400, detail="项目正在生成中")

    # Update project status
    project.status = DBProjectStatus.GENERATING
    db.commit()

    # Create task record
    task_record = Task(
        project_id=project.id,
        celery_task_id=f"sync_{project_id}_{datetime.now(timezone.utc).timestamp()}",
        status="running"
    )
    db.add(task_record)
    db.commit()

    # 调用生成函数，传入当前 session
    result = generate_skill_sync(project_id, db)

    if result["status"] == "error":
        # Update status on error
        project.status = DBProjectStatus.FAILED
        project.error_message = result["message"]
        task_record.status = "failure"
        task_record.result = json.dumps({"error": result["message"]})
        db.commit()
        raise HTTPException(status_code=500, detail=f"生成失败: {result['message']}")

    return GenerateResponse(
        task_id=task_record.celery_task_id,
        message="技能包生成完成"
    )


@router.get("/{project_id}/status", response_model=TaskStatusResponse)
def get_project_status(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取项目生成状态"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    # Get latest task
    task = db.query(Task).filter(
        Task.project_id == project.id
    ).order_by(Task.created_at.desc()).first()

    if task:
        return TaskStatusResponse(
            task_id=task.celery_task_id,
            status=TaskStatus(task.status.value if hasattr(task.status, 'value') else task.status),
            result=json.loads(task.result) if task.result else None,
            error=project.error_message
        )

    return TaskStatusResponse(
        task_id="",
        status=TaskStatus.PENDING,
        result=None,
        error=None
    )


@router.get("/{project_id}/download")
def download_skill_package(
    project_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """下载生成的技能包 ZIP 文件"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == int(current_user["user_id"])
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    if project.status != DBProjectStatus.COMPLETED or not project.output_path:
        raise HTTPException(status_code=400, detail="项目尚未生成完成")

    # 安全检查：确保文件路径在 UPLOAD_DIR 范围内（防路径遍历）
    real_upload_dir = os.path.realpath(settings.UPLOAD_DIR)
    real_file_path = os.path.realpath(project.output_path)
    if not real_file_path.startswith(real_upload_dir + os.sep) and real_file_path != real_upload_dir:
        logger.warning(f"路径遍历尝试: {project.output_path}")
        raise HTTPException(status_code=403, detail="文件路径不合法")

    # Check if file exists
    if not os.path.exists(project.output_path):
        raise HTTPException(status_code=404, detail="文件不存在，请重新生成")

    # Get filename from path
    filename = os.path.basename(project.output_path)

    return FileResponse(
        path=project.output_path,
        filename=filename,
        media_type="application/zip"
    )
