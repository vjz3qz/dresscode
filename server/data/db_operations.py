import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def add_item(name, type, key):
    supabase.table("items").insert(
        {"name": name, "type": type, "s3_key": key}
    ).execute()

def get_outfits(user_id, outfit_ids):
    response = supabase.table("outfits").select("*").eq("user_id", user_id).in_("id", outfit_ids).execute()
    data = response.data
    return data

def get_all_items(user_id):
    response = supabase.table("items").select("*").eq("user_id", user_id).execute()
    data = response.data
    return data

def get_suggested_outfit_job(user_id, suggested_outfit_id):
    response = supabase.table("suggested_outfits").select("*").eq("user_id", user_id).eq("id", suggested_outfit_id).execute() 
    data = response.data
    return data

def complete_suggested_outfit_job(user_id, suggested_outfit_id, suggested_outfit):
    response = supabase.table("suggested_outfits").update(suggested_outfit).eq("user_id", user_id).eq("id", suggested_outfit_id).execute() 
    data = response.data
    return data
