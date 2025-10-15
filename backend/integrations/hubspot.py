# hubspot.py

import json
import secrets
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import base64

from redis_client import add_key_value_redis, get_value_redis, delete_key_redis
from integrations.integration_item import IntegrationItem

CLIENT_ID = 'b84ae56b-bd25-42ab-971b-9e7278c364e0'
CLIENT_SECRET = '435333eb-c9e3-427e-b625-de0c33102a2a'
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'
authorization_url = f'https://app.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&response_type=code&redirect_uri={REDIRECT_URI}&scope=crm.objects.contacts.read%20crm.objects.companies.read'

async def authorize_hubspot(user_id, org_id):
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode('utf-8')).decode('utf-8')

    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', json.dumps(state_data), expire=600)

    return f'{authorization_url}&state={encoded_state}'

async def oauth2callback_hubspot(request: Request):
    if request.query_params.get('error'):
        raise HTTPException(status_code=400, detail=request.query_params.get('error_description'))
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    if not encoded_state:
        raise HTTPException(status_code=400, detail='Missing state parameter.')
    state_data = json.loads(base64.urlsafe_b64decode(encoded_state).decode('utf-8'))

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')

    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')

    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                'https://api.hubapi.com/oauth/v1/token',
                data={
                    'grant_type': 'authorization_code',
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'redirect_uri': REDIRECT_URI,
                    'code': code
                }
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}')
        )

    await add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', json.dumps(response.json()), expire=600)

    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)

async def get_hubspot_credentials(user_id, org_id):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    credentials = json.loads(credentials)
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')

    return credentials

async def create_integration_item_metadata_object(response_json, item_type):
    from datetime import datetime
    properties = response_json.get('properties', {})
    name = properties.get('name') or properties.get('firstname', '') + ' ' + properties.get('lastname', '').strip() or f"{item_type.capitalize()} {response_json['id']}"
    creation_time = properties.get('createdate')
    if creation_time:
        creation_time = datetime.fromisoformat(creation_time.replace('Z', '+00:00'))
    last_modified_time = properties.get('lastmodifieddate')
    if last_modified_time:
        last_modified_time = datetime.fromisoformat(last_modified_time.replace('Z', '+00:00'))

    return IntegrationItem(
        id=response_json['id'],
        name=name,
        type=item_type,
        creation_time=creation_time,
        last_modified_time=last_modified_time,
    )

async def get_items_hubspot(credentials):
    credentials = json.loads(credentials)
    access_token = credentials.get('access_token')
    if not access_token:
        raise HTTPException(status_code=400, detail='No access token in credentials.')

    headers = {'Authorization': f'Bearer {access_token}'}
    items = []

    async def fetch_all_objects(object_type):
        url = f'https://api.hubapi.com/crm/v3/objects/{object_type}'
        after = None
        while True:
            params = {}
            if after:
                params['after'] = after
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params)
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f'Failed to fetch {object_type}: {response.text}')
            data = response.json()
            for obj in data.get('results', []):
                items.append(await create_integration_item_metadata_object(obj, object_type))
            paging = data.get('paging')
            if paging and 'next' in paging:
                after = paging['next']['after']
            else:
                break

    await fetch_all_objects('contacts')
    await fetch_all_objects('companies')

    return items