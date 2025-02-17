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