"""This module contains the Celery worker tasks for the Supplier Outbound service."""

import json
import os
import threading
from celery import Celery
from core.image_segmentation import process_image_s3, upload_file_obj_to_s3, upload_image_to_s3, get_image_url_s3
from data.db_operations import complete_suggested_outfit_job, get_outfits, get_all_items, get_suggested_outfit_job
from core.chat_model import OpenAIChatClient


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

client = OpenAIChatClient()

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
    # process_image_s3("dresscode-ai", file_name, "processed_" + file_name)
    # add_item(file_name, "clothing", "processed_" + file_name)
    return {"filename": file_name, "status": "file uploaded successfully"}

@celery.task(name="tasks.get_image_url")
def get_image_url_task(key):
    """
    Get the URL of an image in the S3 bucket.
    Args:
        key (str): The name of the image file.
    Returns:
        str: The URL of the image.
    """
    return get_image_url_s3(key)

@celery.task(name="tasks.closet_wrapped")
def closet_wrapped_task(user_id, outfit_ids):
    # fetch outfit urls
    outfits = get_outfits(user_id, outfit_ids)
    url_fetches = [get_image_url_s3(outfit["s3_key"]) for outfit in outfits]
    urls = [ url_fetch["url"] for url_fetch in url_fetches if "error" not in url_fetch]
    # feed to chat
    image_response = client.send_image_query(
        """You are given a recap of the outfits worn by an individual over the last week. 
        give a quirky/extravagant/gen Z one liner about the outfits the person wore this past week. 
        This should be upbeat, and not negative.""",
        urls)
    return image_response

@celery.task(name="tasks.suggest_outfit")
def suggest_outfit_task(user_id, suggested_outfit_id):
    # fetch suggested outfit row
    suggest_outfit_job = get_suggested_outfit_job(user_id, suggested_outfit_id)
    if not suggest_outfit_job:
        return 400
    else:
        suggest_outfit_job = suggest_outfit_job[0]
    occasion = suggest_outfit_job["occasion"]
    # fetch outfit urls
    items = get_all_items(user_id)
    for item in items:
        url_fetch = get_image_url_s3(item["s3_key"])
        if "error" not in url_fetch:
            item["image_url"] = url_fetch["url"]
    # feed to chat
    result = client.suggest_outfit_for_occasion(
        occasion,
        items)
    
    selected_items = result["selected_items"]

    # Convert Pydantic items to dicts so we can JSON-encode them
    current_selection_dicts = []
    for item in selected_items:
        # If 'item' is a Pydantic model, convert to dict
        current_selection_dicts.append(item.model_dump())
    notes = result["notes"]
    result_dict = {
        "selected_items": current_selection_dicts,
        "notes": notes,
    }
    # upload back to supabase
    suggested_outfit = {
        **suggest_outfit_job,
        **result_dict,
    }
    response = complete_suggested_outfit_job(user_id, suggested_outfit_id, suggested_outfit)
    if response:
        return 200
    else: 
        return 500



if __name__ == "__main__":
    options = {
        "loglevel": "INFO",
        "traceback": True,
    }

    celery.Worker(pool_cls="threads", **options).start()
