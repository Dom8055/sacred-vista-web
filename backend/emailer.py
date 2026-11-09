import ipaddress
import logging
import os
import re
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

import httpx

logger = logging.getLogger("sacredvista.email")

EMAIL_BASE_URL = "https://integrations.emergentagent.com"

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None) -> str | None:
    _assert_safe_email(subject, html)
    from_name = os.environ.get("EMAIL_FROM_NAME", "Sacred Vista")
    email_key = os.environ.get("EMERGENT_EMAIL_KEY", "")
    payload = {"to": [to], "subject": subject, "html": html, "from_name": from_name}
    if reply_to:
        payload["contact_email"] = reply_to
    if not email_key:
        logger.info("Email key not configured, skipping send.")
        return None
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                                 headers={"X-Email-Key": email_key}, json=payload)
    if resp.status_code >= 400:
        try:
            info = resp.json()
        except ValueError:
            info = {}
        if info.get("code") in ("insufficient_credits", "integration_disabled", "daily_limit_reached"):
            logger.warning("Email paused: %s (%s): %s", info.get("code"), resp.status_code, info.get("message", ""))
        else:
            logger.error("Email send failed: %s %s", resp.status_code, resp.text)
        return None
    return resp.json().get("id")


def _row(label: str, value: str) -> str:
    return (f'<tr><td style="padding:6px 16px 6px 0;color:#8A9784;font-size:12px;text-transform:uppercase;'
            f'letter-spacing:1px;vertical-align:top">{escape(label)}</td>'
            f'<td style="padding:6px 0;color:#222A25;font-size:15px">{escape(value or "-")}</td></tr>')


async def notify_new_inquiry(inq: dict, segment_label: str, context: str) -> None:
    """Fixed server-side template; recipient comes from OWNER_EMAIL env (never request input)."""
    try:
        brand = os.environ.get("EMAIL_FROM_NAME", "Sacred Vista")
        site = os.environ.get("SITE_URL", "").rstrip("/")
        link = (f'<p style="margin:24px 0 0"><a href="{escape(site)}/admin" style="background:#B68B50;color:#14271F;'
                f'padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Open the inquiry desk</a></p>'
                if site.startswith("https://") else "")
        html = (
            '<table role="presentation" width="100%" style="background:#F5F0E5"><tr><td style="padding:32px;font-family:Arial,sans-serif">'
            f'<p style="margin:0;color:#B68B50;font-size:12px;letter-spacing:3px;text-transform:uppercase">{escape(brand)} · New inquiry</p>'
            f'<h1 style="margin:12px 0 20px;font-family:Georgia,serif;font-weight:normal;color:#14271F">{escape(inq["name"])} wants to plan a journey</h1>'
            '<table role="presentation">'
            + _row("Email", inq["email"]) + _row("Phone", inq["phone"]) + _row("Travel style", segment_label)
            + _row("Regarding", context) + _row("Received", inq["created_at"][:16].replace("T", " ") + " UTC")
            + '</table>'
            f'<p style="margin:20px 0 0;padding:16px;background:#E8E4DA;color:#222A25;white-space:pre-line">{escape(inq["message"])}</p>'
            + link +
            f'<p style="margin:28px 0 0;font-size:12px;color:#8A9784">Sent automatically by the {escape(brand)} website.</p>'
            '</td></tr></table>'
        )
        owner_email = os.environ.get("OWNER_EMAIL", "obhalane@gmail.com")
        await send_email(to=owner_email, subject=f"New inquiry from {inq['name']} — {brand}",
                         html=html, reply_to=inq["email"])
    except Exception as e:  # never break inquiry storage because of email
        logger.error("Inquiry notification failed: %s", e)
