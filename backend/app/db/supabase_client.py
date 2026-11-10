from supabase import create_client, Client
from app.core.config import settings

def get_supabase_client(access_token: str = None) -> Client:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    if access_token:
        client.postgrest.auth(access_token)
    return client

def get_admin_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)