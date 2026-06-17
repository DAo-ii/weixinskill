import json
import os
import re
import zipfile
import shutil
from datetime import datetime, timezone
from pathlib import Path
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session

from app.celery_app import celery_app
from app.core.config import settings
from app.core.logging_config import get_logger

logger = get_logger(__name__)


def render_template(template_path: str, output_path: str, context: dict):
    """渲染 Jinja2 模板并写入文件"""
    env = Environment(loader=FileSystemLoader(str(Path(template_path).parent)))
    template = env.get_template(Path(template_path).name)
    rendered = template.render(**context)
    Path(output_path).write_text(rendered, encoding="utf-8")
    return rendered


def copy_template_files(template_dir: str, output_dir: str, context: dict):
    """复制模板目录中的非模板文件到输出目录"""
    template_path = Path(template_dir)
    output_path = Path(output_dir)

    for item in template_path.rglob('*'):
        if item.is_file() and not item.suffix == '.jinja2':
            rel_path = item.relative_to(template_path)
            dest_path = output_path / rel_path
            dest_path.parent.mkdir(parents=True, exist_ok=True)

            # 只渲染.jinja2后缀的文件，不渲染普通.js文件
            if item.suffix == '.jinja2':
                env = Environment(loader=FileSystemLoader(str(item.parent)))
                template = env.get_template(item.name)
                rendered = template.render(**context)
                dest_path.write_text(rendered, encoding="utf-8")
            else:
                shutil.copy2(item, dest_path)


def _resolve_template_dir(template_id: str) -> Path:
    """
    根据 template_id 解析实际模板目录。
    使用 models.TEMPLATE_DIR_MAP 映射，失败时 fallback 到 milk_tea_shop。
    """
    from app.models import TEMPLATE_DIR_MAP

    dir_name = TEMPLATE_DIR_MAP.get(template_id, template_id)
    template_dir = Path(settings.TEMPLATES_DIR) / dir_name

    if template_dir.exists():
        return template_dir

    # Fallback: 直接用 template_id 作为目录名
    fallback = Path(settings.TEMPLATES_DIR) / template_id
    if fallback.exists():
        return fallback

    # Final fallback
    logger.warning(f"模板目录不存在: {template_dir}，使用默认 milk_tea_shop")
    return Path(settings.TEMPLATES_DIR) / "milk_tea_shop"


def generate_skill_sync(project_id: int, db: Session, progress_callback=None):
    """
    同步生成 AI 技能包的核心逻辑

    Args:
        project_id: 项目ID
        db: 数据库 session（由调用方传入，保证事务一致性）
        progress_callback: 可选的进度回调函数，接收 (progress, message) 参数

    Returns:
        dict: 包含生成结果的字典
    """
    from app.models import Project, Task, ProjectStatus, TaskStatus

    def report_progress(progress: int, message: str):
        if progress_callback:
            progress_callback(progress, message)

    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"status": "error", "message": "Project not found"}

        task = db.query(Task).filter(
            Task.project_id == project_id
        ).order_by(Task.created_at.desc()).first()

        if task:
            task.status = TaskStatus.RUNNING
            db.commit()

        config = json.loads(project.config_json) if project.config_json else {}

        report_progress(10, "加载模板...")

        context = {
            "shop_name": config.get("shop_name", "我的店铺"),
            "ai_name": config.get("ai_name", "小助手"),
            "products": config.get("products", []),
            "hours": config.get("hours", ""),
            "discount": config.get("discount", ""),
            "generation_time": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        }

        template_dir = _resolve_template_dir(project.template_id)

        output_dir = Path(settings.UPLOAD_DIR) / f"project_{project_id}_output"
        if output_dir.exists():
            shutil.rmtree(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        report_progress(30, "渲染 SKILL.md...")

        skill_md_template = template_dir / "SKILL.md.jinja2"
        if skill_md_template.exists():
            render_template(str(skill_md_template), str(output_dir / "SKILL.md"), context)
        else:
            skill_md = f"""# {context['shop_name']} AI 助手

## 概述
由码上未来自动生成的 AI 技能包。

## 店铺信息
- 店铺名称: {context['shop_name']}
- AI 助手名称: {context['ai_name']}

## 产品列表
"""
            for p in context['products']:
                skill_md += f"- {p['name']}: ¥{p['price']}\n"
            (output_dir / "SKILL.md").write_text(skill_md, encoding="utf-8")

        report_progress(50, "渲染 mcp.json...")

        mcp_json_template = template_dir / "mcp.json.jinja2"
        if mcp_json_template.exists():
            render_template(str(mcp_json_template), str(output_dir / "mcp.json"), context)
        else:
            mcp_json = {
                "name": f"{context['shop_name']}_assistant",
                "version": "1.0.0",
                "description": f"{context['shop_name']} AI Assistant",
                "functions": [
                    {"name": "queryProduct", "description": "查询产品信息"}
                ]
            }
            (output_dir / "mcp.json").write_text(
                json.dumps(mcp_json, indent=2, ensure_ascii=False),
                encoding="utf-8"
            )

        report_progress(70, "复制原子接口和组件代码...")

        copy_template_files(str(template_dir), str(output_dir), context)

        app_json_path = output_dir / "app.json"
        if not app_json_path.exists():
            app_json = {
                "pages": ["pages/index/index"],
                "window": {"navigationBarTitleText": context['shop_name']}
            }
            app_json_path.write_text(json.dumps(app_json, indent=2, ensure_ascii=False), encoding="utf-8")

        report_progress(85, "打包 ZIP 文件...")

        # Sanitize filename for filesystem compatibility
        safe_name = re.sub(r'[^\w\-_.]', '_', context['shop_name'])
        zip_filename = f"{safe_name}_skill_v1.0.0.zip"
        zip_path = Path(settings.UPLOAD_DIR) / zip_filename

        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in output_dir.rglob('*'):
                if file_path.is_file():
                    arcname = file_path.relative_to(output_dir)
                    zipf.write(file_path, arcname)

        report_progress(95, "清理临时文件...")

        shutil.rmtree(output_dir)

        report_progress(100, "生成完成！")

        project.status = ProjectStatus.COMPLETED
        project.output_path = str(zip_path)

        if task:
            task.status = TaskStatus.SUCCESS
            task.result = json.dumps({
                "output_path": str(zip_path),
                "filename": zip_filename,
                "download_url": f"/api/projects/{project_id}/download"
            })

        db.commit()

        logger.info(f"项目 {project_id} 技能包生成成功: {zip_filename}")

        return {
            "status": "success",
            "progress": 100,
            "message": "技能包生成完成",
            "output_path": str(zip_path),
            "filename": zip_filename,
            "download_url": f"/api/projects/{project_id}/download"
        }

    except Exception as e:
        import traceback
        logger.error(f"项目 {project_id} 生成失败: {e}\n{traceback.format_exc()}")

        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            project.status = ProjectStatus.FAILED
            project.error_message = str(e)
            db.commit()

        if task:
            task.status = TaskStatus.FAILURE
            task.result = json.dumps({"error": str(e)})
            db.commit()

        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True, name="generate_skill")
def generate_skill_task(self, project_id: int):
    """Celery 异步任务包装器"""
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        def progress_callback(progress, message):
            self.update_state(state="PROGRESS", meta={"progress": progress, "message": message})

        return generate_skill_sync(project_id, db, progress_callback)
    finally:
        db.close()
