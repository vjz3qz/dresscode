"""This module contains the Celery worker tasks for the Supplier Outbound service."""

import os
import threading
from celery import Celery
from core.image_segmentation import process_image_s3, upload_file_obj_to_s3, upload_image_to_s3, get_image_url_s3
from data.db_operations import add_item

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

@celery.task(name="tasks.upload")
def upload_task(file_content, file_name, file_content_type):
    """
    Upload a file to S3.
    Args:
        file (FileStorage): The file to upload.
    Returns:
        dict: The result of the upload.
    """
    upload_file_obj_to_s3(file_content, file_name, file_content_type)
    process_image_s3("dresscode-ai", file_name, "processed_" + file_name)
    add_item(file_name, "clothing", "processed_" + file_name)
    return {"filename": "processed_" + file_name, "status": "file uploaded successfully"}

@celery.task(name="tasks.get_image_url")
def get_image_url_task(filename):
    """
    Get the URL of an image in the S3 bucket.
    Args:
        filename (str): The name of the image file.
    Returns:
        str: The URL of the image.
    """
    return get_image_url_s3(filename)



if __name__ == "__main__":
    options = {
        "loglevel": "INFO",
        "traceback": True,
    }

    celery.Worker(pool_cls="threads", **options).start()
