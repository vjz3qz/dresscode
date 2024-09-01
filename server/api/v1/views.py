"""This module contains the API endpoints for the application."""

from celery.result import AsyncResult
from fastapi import APIRouter, Depends, Body, File, Request, UploadFile
from fastapi.responses import JSONResponse

from core.celery_worker import celery
from core.image_segmentation import upload_file_obj_to_s3
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
async def upload(photo: UploadFile = File(...)):
    upload_file_obj_to_s3(photo)
    return JSONResponse({"filename": photo.filename, "status": "file uploaded successfully", "text": "OK"})

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


def return_task(task):
    # check status of task, return result if ready. loop until ready

    while True:
        task_status = AsyncResult(task.id, app=celery).status
        if task_status == "SUCCESS":
            return JSONResponse({"status": "complete"})
        elif task_status == "FAILURE":
            return JSONResponse({"status": "error"})
        else:
            continue