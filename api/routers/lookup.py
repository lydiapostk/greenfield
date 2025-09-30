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
from api.models import Startup

load_dotenv()

router = APIRouter()

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
)

CA_CERT_PATH = os.getenv("CA_CERT_PATH", None)

TEMP_PLACEHOLDER_JSON_OUTPUT: Startup = {
    "company_name": "Seadronix",
    "company_website": "www.seadronix.com",
    "founders": {
        "Byeolteo Park": "https://www.linkedin.com/in/byeolteo-park-758150120/",
        "Jae-uk Shin": None,
    },
    "funding_stage": "Series B",
    "funds_raised": ">$10M",
    "ref_funding": [
        "Seadronix Secures USD 11.3 million in Series B Funding… Accelerates Global Expansion of Autonomous Navigation AI Solutions (prnewswire.com) https://www.prnewswire.com/news-releases/seadronix-secures-usd-11-3-million-in-series-b-funding-accelerates-global-expansion-of-autonomous-navigation-ai-solutions-302401752.html",
        "Seadronix raises $11m to support further development of autonomous vessel tech (smartmaritimenetwork.com) https://smartmaritimenetwork.com/2025/03/18/seadronix-raises-11m-to-support-further-development-of-autonomous-vessel-tech/",
    ],
    "investors": [
        "LB Investment",
        "KB Investment",
        "Korea Development Bank",
        "Wonik Investment Partners",
        "Lighthouse Combined Investment",
    ],
    "tech_offering": "Seadronix develops AI-powered solutions for autonomous navigation and port operation, aimed at enhancing safety and efficiency in the maritime industry. Its flagship system, NAVISS, is an AI navigation support platform that combines multiple sensors—including radar, LiDAR, and optical cameras—to generate a comprehensive 360° awareness map around vessels. This allows ships to detect and classify nearby objects, assess collision risks, and provide decision support to navigators. Another product, Rec-SEA, augments existing onboard cameras with AI capabilities, upgrading legacy systems into intelligent perception tools. For port operations, Seadronix offers AVISS, a platform that integrates vessel tracking, berth management, and safety features such as worker and fire detection, giving port authorities greater operational oversight. The company emphasizes sensor fusion and AI-driven perception models, trained on real-world maritime data, to handle challenging environments such as crowded harbors and low-visibility conditions. Seadronix has achieved type approval from classification societies, a first in its field, and has deployed its systems in real-world environments in Korea, with expanding international pilots in Singapore and Europe. Its technology not only aims to enable autonomous ships but also provides immediate safety and efficiency benefits for semi-autonomous and manned vessels.",
    "ref_tech": [
        "Safetytech Accelerator – Seadronix profile (safetytechaccelerator.org) https://safetytechaccelerator.org/wp-content/uploads/2023/05/Seadronix-profile-2.pdf",
        "Seadronix Secures USD 11.3 million in Series B Funding (prnewswire.com) https://www.prnewswire.com/news-releases/seadronix-secures-usd-11-3-million-in-series-b-funding-accelerates-global-expansion-of-autonomous-navigation-ai-solutions-302401752.html",
        "Seadronix raises $11m to support further development of autonomous vessel tech (smartmaritimenetwork.com) https://smartmaritimenetwork.com/2025/03/18/seadronix-raises-11m-to-support-further-development-of-autonomous-vessel-tech/",
    ],
    "uvp": "Seadronix’s unique value proposition lies in delivering maritime AI solutions that combine cutting-edge sensor fusion, real-world operational data, and regulatory compliance to solve one of the industry’s most pressing challenges: safe and reliable navigation in complex sea environments. Unlike single-sensor systems, Seadronix integrates data from radar, LiDAR, and optical cameras, producing robust situational awareness across diverse conditions. This enables ships to avoid collisions with both large vessels and smaller, harder-to-detect obstacles like buoys or fishing boats. The company offers modular solutions—NAVISS for vessels, Rec-SEA to upgrade existing camera systems, and AVISS for port authorities—allowing customers to adopt technology incrementally based on their needs. Its early acquisition of classification society type approval provides a trust advantage, reducing risk for operators considering adoption. Furthermore, Seadronix is not limited to future autonomous shipping—it delivers immediate value for today’s manned and semi-autonomous vessels, improving safety, reducing operational inefficiencies, and aligning with evolving international regulations. The combination of proven deployments, regulatory endorsements, and a modular product approach positions Seadronix as a bridge between the current maritime landscape and the autonomous future.",
    "ref_uvp": [
        "Seadronix Secures USD 11.3 million in Series B Funding (prnewswire.com) https://www.prnewswire.com/news-releases/seadronix-secures-usd-11-3-million-in-series-b-funding-accelerates-global-expansion-of-autonomous-navigation-ai-solutions-302401752.html",
        "Safetytech Accelerator – Seadronix profile (safetytechaccelerator.org) https://safetytechaccelerator.org/wp-content/uploads/2023/05/Seadronix-profile-2.pdf",
        "Seadronix raises $11m to support further development of autonomous vessel tech (smartmaritimenetwork.com) https://smartmaritimenetwork.com/2025/03/18/seadronix-raises-11m-to-support-further-development-of-autonomous-vessel-tech/",
    ],
    "year_founded": "2015",
    "country": "South Korea",
    "num_employees": "51-100",
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
