import ipaddress
import socket
from typing import Optional
from urllib.parse import urlparse
from dotenv import load_dotenv
from fastapi import APIRouter, Query
import json
from fastapi import Depends
import httpx
from openai import OpenAI
import os
from pydantic import BaseModel
from sqlmodel import Session
from api.database import get_session
from api.models import Startup

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
    # Try HTTPS
    try:
        https_url = f"https://{hostname}"
        async with httpx.AsyncClient(
            timeout=3,
            follow_redirects=True,
            verify=CA_CERT_PATH or True,  # fallback to default cert store
        ) as client:
            resp = await client.head(https_url)
            if resp.status_code < 400:
                return https_url
    except Exception:
        pass

    # Try HTTP
    try:
        http_url = f"http://{hostname}"
        async with httpx.AsyncClient(timeout=3, follow_redirects=True) as client:
            resp = await client.head(http_url)
            if resp.status_code < 400:
                return http_url
    except Exception:
        pass

    return None


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

        # Try root first
        root_result = await try_protocols(root_hostname)
        if root_result:
            response.exists = True
            response.normalized = root_result
            response.hostname = root_hostname
            return response

        # If root fails, try www
        www_hostname = "www." + root_hostname
        www_result = await try_protocols(www_hostname)
        if www_result:
            response.exists = True
            response.normalized = www_result
            response.hostname = www_hostname
            return response

        # Domain resolves but no web service
        response.exists = True
        response.note = "Domain resolves but no HTTP(S) service found"
        return response

    except Exception as e:
        response.error = str(e)
        return response


@router.get("/query_llm", response_model=Startup)
def lookup_startup(
    startup_url: str = Query(...), session: Session = Depends(get_session)
):
    with open("api/instruction.txt", "r", encoding="utf-8") as f:
        instruction = f.read()
    with open("api/input_template.txt", "r", encoding="utf-8") as f:
        input_template = f.read()
    input = f"{', '.join(startup_url)}: {input_template}"
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
    startup = Startup.model_validate(startup_info)
    startup.company_website = startup_url
    session.add(startup)
    session.commit()
    session.refresh(startup)
    if not startup:
        return {"error": "Startup not found"}
    return startup
