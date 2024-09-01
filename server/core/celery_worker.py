"""This module contains the Celery worker tasks for the Supplier Outbound service."""

import os
import threading
from celery import Celery
import time
from core.image_segmentation import process_image_s3, upload_image_to_s3

CHECK_EMAIL_LOCK = threading.Lock()

REDIS_HOSTNAME = os.getenv("REDIS_HOSTNAME")
REDIS_PORT = os.getenv("REDIS_PORT")

if REDIS_HOSTNAME == "localhost":
    celery = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
else:
    # we're using a hosted redis and need TLS enabled
    celery = Celery(
        "tasks",
        broker=f"rediss://{REDIS_HOSTNAME}:{REDIS_PORT}/0?ssl_cert_reqs=CERT_REQUIRED",
        backend=f"rediss://{REDIS_HOSTNAME}:{REDIS_PORT}/0?ssl_cert_reqs=CERT_REQUIRED",
    )
    
@celery.task(name="tasks.process_image")
def process_image_task(image_url):
    """
    Process an image by removing the background.
    Args:
        image_url (str): The URL of the image to process.
    Returns:
        str: The URL of the processed image.
    """
    # process the image
    output_image_url = process_image_s3(image_url)
    return output_image_url

@celery.task(name="tasks.upload_image_to_s3")
def upload_image_to_s3_task(bucket_name, key, image_path):
    """
    Upload an image to an S3 bucket.
    Args:
        bucket_name (str): The name of the S3 bucket.
        key (str): The key of the object in the S3 bucket.
        image_path (str): The path to the image file.
    """
    upload_image_to_s3(bucket_name, key, image_path)


if __name__ == "__main__":
    options = {
        "loglevel": "INFO",
        "traceback": True,
    }

    celery.Worker(pool_cls="threads", **options).start()
