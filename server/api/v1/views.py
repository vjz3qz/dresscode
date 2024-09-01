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
