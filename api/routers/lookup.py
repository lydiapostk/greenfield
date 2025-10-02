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
from pydantic import BaseModel, ValidationError
from sqlmodel import Session, select
from api.database import get_session
from api.models.data_models import Startup

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

CA_CERT_PATH = os.getenv("CA_CERT_PATH", None)

TEMP_PLACEHOLDER_JSON_OUTPUT: Startup = {
    "company_name": "Weitu AI",
    "company_website": "https://weitu.ai",
    "year_founded": "2024",
    "country": "Hong Kong",
    "num_employees": "11-50",
    "founders": {"Liwei Wang, Ph.D.": ""},
    "investors": [
        "ICO Group Limited",
        "Unnamed global internet technology companies and angel investors",
    ],
    "funding_stage": "Seed",
    "funds_raised": "$1M-$5M",
    "ref_funding": [
        "TipRanks: ICO Group Limited announces subscription of preferred shares in Weitu AI Inc. for US$3,000,000 (https://www.tipranks.com/news/company-announcements/ico-group-limited-announces-subscription-of-preferred-shares-in-weitu-ai-inc)",
        "AIBase / \u7ad9\u957f\u4e4b\u5bb6 reporting Weitu AI completed an angel round with a post-money valuation of US$100M (https://www.aibase.com/news/5602)",
        "1AI.net coverage of Weitu AI's angel round and valuation (https://www.1ai.net/en/4418.html)",
    ],
    "tech_offering": "Weitu AI develops full\u2011stack multimodal large models and products that understand and generate across text, image, audio and video modalities. Their platform focuses on multimodal understanding, retrieval and generation, and exposes productized applications such as InstMind (YouTube-video understanding and insight extraction). The company positions its technology to accelerate multimodal workflows for both individual productivity and enterprise applications, and to integrate into device manufacturers and service systems for richer interactive experiences.",
    "ref_tech": [
        "Weitu AI official site \u2013 technology and products overview (https://weitu.ai/)",
        "Weitu AI English site \u2013 product mention (InstMind) and multimodal model focus (https://weitu.ai/en)",
        "Weitu AI hiring page describing multimodal algorithm roles and stack (https://weitu.ai/en/join-us/)",
    ],
    "uvp": "Weitu AI's unique value proposition is delivering practical, product\u2011driven multimodal AI that converts complex audio/video/text/image inputs into actionable insights and interactive experiences. By building full\u2011stack multimodal models and shipping verticalized products (e.g., video understanding tools) the company aims to raise individual productivity and enable businesses to embed multimodal intelligence into devices and services\u2014targeting scenarios from smartphone AI features to enterprise data asset unlocking.",
    "ref_uvp": [
        "Weitu AI official site \u2013 product and mission statement (https://weitu.ai/)",
        "Weitu AI English site \u2013 product positioning and InstMind showcase (https://weitu.ai/en)",
    ],
    "trl": "TRL 5-7",
    "trl_explanation": "Weitu AI presents deployed product prototypes (InstMind) and commercial collaborations with device makers and internet companies, indicating validated prototypes and early commercial integration rather than only research proofs of concept.",
    "competitors": [
        {
            "OpenAI": {
                "description": "Provider of large multimodal models (GPT family) and APIs used for text, image and limited multimodal tasks; strong ecosystem and developer adoption.",
                "url": "https://openai.com",
            }
        },
        {
            "Anthropic": {
                "description": "Developer of large language models with a focus on safety and helpfulness; expanding multimodal capabilities and enterprise offerings as alternatives to other LLM providers.",
                "url": "https://www.anthropic.com",
            }
        },
    ],
    "use_cases": [
        "Automated understanding and summarization of long-form videos (education, training, content indexing)",
        "Multimodal assistant and on\u2011device AI features for smartphones and consumer devices",
        "Enterprise multimodal data search and insight extraction from mixed media repositories",
        "Interactive multimodal interfaces for service robots and intelligent systems",
    ],
}


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


@router.get("/query_llm", response_model=Startup)
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
            startup = Startup.model_validate(startup_info)
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
    # startup = Startup.model_validate(TEMP_PLACEHOLDER_JSON_OUTPUT)
    startup.company_website = startup_url
    session.add(startup)
    session.commit()
    startup = session.exec(
        select(Startup).where(Startup.company_website == startup_url)
    ).one_or_none()  # Fetch updated startup
    return startup
