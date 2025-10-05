import httpx
import ipaddress
import json
import os
import socket
from dotenv import load_dotenv
from fastapi import APIRouter, Query
from fastapi import Depends
from openai import OpenAI
from pydantic import BaseModel, ValidationError
from sqlmodel import Session
from typing import Optional
from urllib.parse import urlparse

from api.database import get_session
from api.models.data_models import Startup, StartupUpsert
from api.models.read_models import StartupReadLite

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

CA_CERT_PATH = os.getenv("CA_CERT_PATH", None)


class CheckDomainResponse(BaseModel):
    exists: bool
    normalized: Optional[str] = None
    error: Optional[str] = None
    note: Optional[str] = None
    hostname: Optional[str] = None


def is_public_ip(hostname: str) -> bool:
    """Check if hostname resolves to a public IP address."""
    try:
        ip = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip)
        return not (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
        )
    except Exception:
        return False


async def try_protocols(hostname: str) -> Optional[str]:
    """Try HTTPS first, then HTTP, return working URL or None."""

    async def check_url(url: str) -> Optional[str]:
        async with httpx.AsyncClient(
            timeout=3,
            follow_redirects=True,
            verify=False,  # TODO: DANGEROUS! Temporarily disable SSL check
            # verify=CA_CERT_PATH or True,
        ) as client:
            try:
                resp = await client.head(url)
                if resp.status_code < 400:
                    return url
                if resp.status_code in (403, 405):  # Forbidden or Method Not Allowed
                    resp = await client.get(url)
                    if resp.status_code < 400:
                        return url
            except Exception:
                return None
        return None

    # Try HTTPS
    https_url = f"https://{hostname}"
    result = await check_url(https_url)
    if result:
        return result

    # Try HTTP
    http_url = f"http://{hostname}"
    return await check_url(http_url)


@router.get("/check_url", response_model=CheckDomainResponse)
async def check_url(url: str = Query(...)):
    """Validate URL, prefer root domain but fallback to www if needed."""
    response = CheckDomainResponse(
        exists=False, normalized=None, error=None, note=None, hostname=None
    )

    try:
        parsed = urlparse(url if "://" in url else f"https://{url}")
        hostname = parsed.hostname
        if not hostname:
            response.error = "Invalid hostname"
            return response
        response.hostname = hostname

        # Block private/internal IPs
        if not is_public_ip(hostname):
            response.error = "Only public IPs are allowed"
            return response

        # Strip www. for root preference
        root_hostname = hostname[4:] if hostname.startswith("www.") else hostname

        # Try with www first
        www_hostname = "www." + root_hostname
        www_result = await try_protocols(www_hostname)
        if www_result:
            response.exists = True
            response.normalized = www_result
            response.hostname = www_hostname
            return response

        # If www fails, try root
        root_result = await try_protocols(root_hostname)
        if root_result:
            response.exists = True
            response.normalized = root_result
            response.hostname = root_hostname
            return response

        # Domain resolves but no web service
        response.exists = True
        response.note = "Domain resolves but no HTTP(S) service found"
        return response

    except Exception as e:
        response.error = str(e)
        return response


@router.get("/query_llm", response_model=StartupReadLite)
def lookup_startup(
    startup_url: str = Query(...), session: Session = Depends(get_session)
):
    with open("api/instruction.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    input = f"{'; '.join(startup_url)}"
    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort": "low"},
        instructions=instruction,
        input=input,
        store=True,
        tools=[{"type": "web_search"}],
        stream=False,
    )
    startup_info = json.loads(response.output_text)
    try:
        with open("tmp_output.json", "w") as json_file:
            json.dump(startup_info, json_file, indent=4)
        print("JSON data successfully dumped.")
    except IOError as e:
        print(f"Error writing to file: {e}")
    startup = None
    while not startup:
        try:
            startup = StartupUpsert.model_validate(startup_info)
        except ValidationError as e:
            e_locs = [err["loc"] for err in e.errors()]
            for keys_to_delete in e_locs:
                if (len(keys_to_delete)) == 1:
                    startup_info.pop(keys_to_delete[0])
                else:
                    target_dict = startup_info
                    for key_to_delete in keys_to_delete[:-1]:
                        target_dict = target_dict[key_to_delete]
                    target_dict.pop(keys_to_delete[-1])
    startup.company_website = startup_url
    startup = Startup(**startup.model_dump())
    if startup.tech_offering:
        startup.tech_embedding = (
            client.embeddings.create(
                model="text-embedding-3-small", input=startup.tech_offering
            )
            .data[0]
            .embedding
        )
    session.add(startup)
    session.commit()
    session.refresh(startup)  # Fetch updated startup
    return startup
