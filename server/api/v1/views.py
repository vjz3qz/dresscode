"""This module contains the API endpoints for the application."""

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, Body
from fastapi.responses import JSONResponse

from core.celery_worker import celery
from utils.dependencies import validate_token

router = APIRouter()




@router.get("/health")
async def health():
    """
    Health check endpoint.
    Returns:
        JSONResponse: Returns {"text": "OK"} if the service is running.
    """
    return JSONResponse({"text": "OK"})


@router.post("/process-image")
async def process_image(
    image_url: str = Body(...),
    token: str = Depends(validate_token),
):
    """
    Process an image by removing the background.
    Args:
        image_url (str): The URL of the image to process.
        token (str): The JWT token.
    Returns:
        JSONResponse: Returns the task ID of the Celery task.
    """
    task = celery.send_task("tasks.process_image", args=[image_url])
    return JSONResponse({"task_id": task.id})

@router.get("/task-status/{task_id}")
async def task_status(
    task_id: str,
    token: str = Depends(validate_token),
):
    """
    Get the status of a Celery task.
    Args:
        task_id (str): The ID of the Celery task.
        token (str): The JWT token.
    Returns:
        JSONResponse: Returns the status of the task.
    """
    task = AsyncResult(task_id, app=celery)
    return JSONResponse({"status": task.status})

@router.post("/upload-image-to-s3")
async def upload_image_to_s3(
    bucket_name: str = Body(...),
    key: str = Body(...),
    image_path: str = Body(...),
    token: str = Depends(validate_token),
):
    """
    Upload an image to an S3 bucket.
    Args:
        bucket_name (str): The name of the S3 bucket.
        key (str): The key of the object in the S3 bucket.
        image_path (str): The path to the image file.
        token (str): The JWT token.
    Returns:
        JSONResponse: Returns the task ID of the Celery task.
    """
    task = celery.send_task("tasks.upload_image_to_s3", args=[bucket_name, key, image_path])
    return JSONResponse({"task_id": task.id})