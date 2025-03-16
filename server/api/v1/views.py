"""This module contains the API endpoints for the application."""

import json
from typing import List, Optional
from celery import uuid
from celery.result import AsyncResult
from fastapi import APIRouter, Depends, Body, File, Query, Request, UploadFile
from fastapi.responses import JSONResponse
import time
import uuid

from core.celery_worker import celery
from core.celery_worker import remove_background_task, upload_task, get_image_url_task, suggest_outfit_task, get_closet_wrapped_task
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
async def upload(file: UploadFile = File(...), token_payload: dict = Depends(validate_token)):
    """
    Upload a file to S3.
    Args:
        file (UploadFile): The file to upload.
    Returns:
        JSONResponse: Returns the task ID of the Celery task.
    """
    file_content = await file.read()
    # file_name = file.filename  
    # randomly generate a file name
    file_name = str(uuid.uuid4()) + ".jpg"
    file_content_type = file.content_type
    task = upload_task.apply(args=(file_content, file_name, file_content_type))
    result = task.get()   # This retrieves the result from your task
    return JSONResponse(content=result)

@router.post("/remove-background")
async def remove_background(key: str = Query(...), token_payload: dict = Depends(validate_token)):
    """
    Get the URL of an image in the S3 bucket.
    Args:
        key (str): The name of the image file.
    Returns:
        JSONResponse: Returns the URL of the image.
    """
    task = remove_background_task.apply(args=(key))
    result = task.get()   # This retrieves the result from your task
    return JSONResponse(content=result)



@router.get("/get-image-url/{key}")
async def get_image_url(key: str, token_payload: dict = Depends(validate_token)):
    """
    Get the URL of an image in the S3 bucket.
    Args:
        key (str): The name of the image file.
    Returns:
        JSONResponse: Returns the URL of the image.
    """
    task = get_image_url_task.apply(args=(key,))
    result = task.get()   # This retrieves the result from your task
    return JSONResponse(content=result)


@router.get("/get-image-urls")
async def get_image_urls(filenames: List[str] = Query(...), token_payload: dict = Depends(validate_token)):
    """
    Get the URLs of images in the S3 bucket.
    Args:
        filenames (List[str]): A list of image filenames.
    Returns:
        JSONResponse: Returns a dictionary containing filenames and their URLs.
    """
    tasks = [get_image_url_task.apply(args=(filename,)) for filename in filenames]
    results = {}

    for filename, task in zip(filenames, tasks):
        task_result = task

        # Extract content from JSONResponse
        content_data = task_result.get()  # Access the internal _body attribute

        # Retrieve the URL if the task was successful
        if content_data.get('status') == 'complete':
            results[filename] = content_data.get('result', {}).get('url', '')
        else:
            results[filename] = ''  # Handle error case by setting an empty string or error message
    return JSONResponse(content=results)


@router.get("/get-closet-wrapped")
async def get_closet_wrapped(outfit_ids: List[int] = Query(...), token_payload: dict = Depends(validate_token)):
    """_summary_

    Args:
        outfit_ids (List[int], optional): _description_. Defaults to Query(...).
    """
    # call celery
    user_id = token_payload.get("sub")
    task = get_closet_wrapped_task.apply(args=(user_id, outfit_ids))
    result = task.get()   # This retrieves the result from your task
    return JSONResponse(content=result)




@router.get("/suggest-outfit")
async def suggest_outfit(suggested_outfit_id: str = Query(...), token_payload: dict = Depends(validate_token)):
    """_summary_

    Args:
        occasion (str, optional): _description_. Defaults to Query(...).
    """
    # call celery
    user_id = token_payload.get("sub")
    task = suggest_outfit_task.apply(args=(user_id, suggested_outfit_id))
    result = task.get()   # This retrieves the result from your task
    return JSONResponse(content=result)


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