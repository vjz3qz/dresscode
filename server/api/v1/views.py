"""This module contains the API endpoints for the application."""

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, Body, File, Request, UploadFile
from fastapi.responses import JSONResponse
import time

from core.celery_worker import celery
from core.image_segmentation import process_image_s3, upload_file_obj_to_s3
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

@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    """
    Upload a file to S3.
    Args:
        file (UploadFile): The file to upload.
    Returns:
        JSONResponse: Returns the task ID of the Celery task.
    """
    file_content = await file.read()
    file_name = file.filename  
    file_content_type = file.content_type
    task = celery.send_task("tasks.upload", args=[file_content, file_name, file_content_type])
    return return_task(task)

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
    return return_task(task)

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
    return return_task(task)



@router.get("/get-image-url/{filename}")
async def get_image_url(filename: str):
    """
    Get the URL of an image in the S3 bucket.
    Args:
        filename (str): The name of the image file.
    Returns:
        JSONResponse: Returns the URL of the image.
    """
    task = celery.send_task("tasks.get_image_url", args=[filename])
    return return_task(task)

def return_task(task):
    # Loop until the task is complete
    while True:
        task_async_result = AsyncResult(task.id, app=celery)
        task_status = task_async_result.status

        if task_status == "SUCCESS":
            # Retrieve the result of the task
            result = task_async_result.result
            return JSONResponse({"status": "complete", "result": result})
        elif task_status == "FAILURE":
            # Retrieve the exception info
            result = task_async_result.result
            return JSONResponse({"status": "error", "result": result})
        else:
            # Sleep for a short duration before checking again to avoid busy waiting
            time.sleep(1)
            continue