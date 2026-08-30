"""Server-side LLM proposal adapter for the recovery agent.

The LLM is used for *reasoning/proposal only*. It has no authority to
execute anything: the deterministic policy engine decides and the action
layer executes only what the policy allows. This module never calls a
payment API, never mutates settings or audit records, and returns ``None``
on any failure so the caller falls back to the existing deterministic
proposal.

Integration contract
--------------------
- Uses an OpenAI-compatible ``/chat/completions`` endpoint via ``httpx``
  (already a pinned project dependency) — no new SDK required.
- All configuration is read from environment variables (optionally loaded
  from ``backend/.env``); the API key is never logged, never returned in
  API responses and never exposed to the frontend.
- The prompt contains only structured, non-sensitive recovery context:
  payment/failure information, amount, deterministic diagnosis, attempt
  number, mandate state and non-sensitive policy context. No customer PII,
  no Razorpay credentials, no secrets.
- The model must return STRICT JSON (``{"proposed_action", "reason",
  "confidence", ...}``). Output is validated field by field; anything
  invalid (bad JSON / action / confidence / missing fields / unknown
  action) is discarded and triggers the deterministic fallback.
- Timeouts, rate limits, HTTP errors and malformed responses are all
  swallowed here and reported as ``None`` so the application never 500s
  because the LLM provider is unavailable.
"""

import json
import os
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv

from app.services.settings import get_settings

_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_ENV_FILE)

# Actions the LLM may propose. The action layer only EXECUTES
# RETRY_LATER / REQUEST_FRESH_MANDATE; NO_ACTION and ESCALATE resolve to a
# no-op/skipped result downstream, and policy decides on top regardless.
PROPOSED_ACTIONS = {
    "RETRY_LATER",
    "REQUEST_FRESH_MANDATE",
    "NO_ACTION",
    "ESCALATE",
}

DEFAULT_MODEL = "gpt-4o-mini"
DEFAULT_BASE_URL = "https://api.openai.com/v1"
DEFAULT_TIMEOUT_SECONDS = 10.0
MAX_RETRY_AFTER_HOURS = 168
MAX_CUSTOMER_MESSAGE_LENGTH = 500

SYSTEM_PROMPT = (
    "You are the recovery proposal component of Mandate Doctor, an agentic "
    "payment/mandate revenue recovery system. You propose a recovery "
    "intervention ONLY. You do NOT have authority to execute it. A separate "
    "deterministic policy engine will make the final decision, and an action "
    "layer executes only what the policy allows. You can never charge a "
    "payment, call payment APIs, change retry limits or cooling-off periods, "
    "override a block or human approval, or modify audit records. Respond "
    "with STRICT JSON only."
)


def _env(name: str, default: Any = None) -> str:
    value = os.environ.get(name)
    return value if value is not None and str(value).strip() != "" else default


def _is_truthy(value: Any) -> bool:
    return str(value).strip().lower() in {"1", "true", "yes", "on"}


def is_config_present() -> bool:
    """Whether a server-side LLM API key is configured at all."""
    return bool(_env("LLM_API_KEY"))


def is_enabled() -> bool:
    """Whether the LLM proposal layer is active.

    Defaults to on when ``AI_PROPOSAL_ENABLED`` is unset (or truthy) AND an
    ``LLM_API_KEY`` is present. With no key configured the layer is purely
    deterministic, so the application runs identically to before.
    """
    if not _is_truthy(_env("AI_PROPOSAL_ENABLED", "true")):
        return False
    return is_config_present()


def _config() -> dict[str, Any]:
    try:
        timeout = float(_env("LLM_TIMEOUT_SECONDS", DEFAULT_TIMEOUT_SECONDS))
    except (TypeError, ValueError):
        timeout = DEFAULT_TIMEOUT_SECONDS

    return {
        "api_key": _env("LLM_API_KEY"),
        "model": _env("LLM_MODEL", DEFAULT_MODEL),
        "base_url": _env("LLM_BASE_URL", DEFAULT_BASE_URL),
        "timeout": timeout,
    }


def build_prompt(payment: dict[str, Any], diagnosis: dict[str, Any]) -> str:
    """Compose the model prompt from structured, non-sensitive context.

    Only information the proposal step actually needs is included. Payment
    credentials, secrets and customer PII are never included.
    """
    settings = get_settings()

    lines = [
        SYSTEM_PROMPT,
        "",
        "A payment failed. Here is the structured, non-sensitive context:",
        "",
        "PAYMENT:",
        f"- payment_id: {payment.get('payment_id')}",
        f"- amount_inr: {payment.get('amount_inr', 0)}",
        f"- failure_code: {payment.get('failure_code') or 'unavailable'}",
        f"- mandate_status: {payment.get('mandate_status', 'active')}",
        f"- attempt_number: {payment.get('attempt_number', 1)}",
        f"- previous_successes: {payment.get('previous_successes', 0)}",
        f"- previous_failures: {payment.get('previous_failures', 0)}",
        "",
        "DIAGNOSIS (deterministic, authoritative first pass):",
        f"- root_cause: {diagnosis.get('root_cause')}",
        f"- diagnosis: {diagnosis.get('diagnosis')}",
        f"- confidence: {diagnosis.get('confidence')}",
        f"- recoverable: {diagnosis.get('recoverable')}",
        f"- recommended_action: {diagnosis.get('recommended_action')}",
        "",
        "POLICY CONTEXT (informational only; you cannot change it):",
        f"- retry_limit: {settings.get('retry_limit')}",
        f"- cooling_off_hours: {settings.get('cooling_off_hours')}",
        "",
        "Choose exactly one proposed_action from: RETRY_LATER, "
        "REQUEST_FRESH_MANDATE, NO_ACTION, ESCALATE.",
        "- RETRY_LATER: wait a sensible cooling-off, then retry. You may "
        f"suggest retry_after_hours in 1..{MAX_RETRY_AFTER_HOURS}.",
        "- REQUEST_FRESH_MANDATE: the customer needs to renew/recreate the "
        "mandate.",
        "- NO_ACTION: do nothing right now.",
        "- ESCALATE: requires human investigation.",
        "",
        'Return STRICT JSON only (no prose, no markdown), e.g.:',
        '{"proposed_action":"RETRY_LATER","reason":"...","confidence":0.0-1.0,'
        '"customer_message":"...","retry_after_hours":12}',
    ]

    return "\n".join(lines)


def _call_chat_completion(
    api_key: str,
    base_url: str,
    model: str,
    prompt: str,
    timeout: float,
) -> str:
    """Call the OpenAI-compatible chat completions endpoint.

    Raises on any transport / HTTP / parse failure; the caller converts
    every failure into the deterministic fallback path.
    """
    url = base_url.rstrip("/") + "/chat/completions"

    body: dict[str, Any] = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 500,
        "reasoning_effort": "low",
        "response_format": {"type": "json_object"},
    }

    response = httpx.post(
        url,
        json=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        timeout=timeout,
    )

    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"]


def _extract_json_object(text: str) -> dict[str, Any] | None:
    """Parse a model response into a dict, tolerating a markdown fence."""
    if not isinstance(text, str):
        return None

    text = text.strip()

    if not text:
        return None

    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    try:
        data = json.loads(text)
    except (json.JSONDecodeError, ValueError, TypeError):
        return None

    return data if isinstance(data, dict) else None


def parse_structured_output(text: str) -> dict[str, Any] | None:
    """Strictly validate the LLM response into the proposal interface.

    Returns ``None`` for anything outside the contract: invalid JSON, an
    unknown action, a missing/blank reason, a missing/out-of-range
    confidence, or invalid optional fields. The caller then uses the
    deterministic fallback.
    """
    data = _extract_json_object(text)
    if data is None:
        return None

    action_value = data.get("proposed_action")
    if not isinstance(action_value, str) or action_value not in PROPOSED_ACTIONS:
        return None

    reason = data.get("reason")
    if not isinstance(reason, str) or not reason.strip():
        return None

    confidence = data.get("confidence")
    if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
        return None

    confidence = float(confidence)
    if not (0.0 <= confidence <= 1.0):
        return None

    proposal: dict[str, Any] = {
        "action": action_value,
        "proposal": reason.strip(),
        "confidence": round(confidence, 3),
        "proposal_source": "llm",
    }

    retry_after_hours = data.get("retry_after_hours")
    if retry_after_hours is not None:
        if isinstance(retry_after_hours, bool) or not isinstance(
            retry_after_hours, (int, float)
        ):
            return None
        retry_after_hours = float(retry_after_hours)
        if not (1 <= retry_after_hours <= MAX_RETRY_AFTER_HOURS):
            return None
        if action_value == "RETRY_LATER":
            proposal["retry_after_hours"] = int(retry_after_hours)

    customer_message = data.get("customer_message")
    if isinstance(customer_message, str) and customer_message.strip():
        proposal["customer_message"] = customer_message.strip()[
            :MAX_CUSTOMER_MESSAGE_LENGTH
        ]

    return proposal


def request_llm_proposal(
    payment: dict[str, Any],
    diagnosis: dict[str, Any],
) -> dict[str, Any] | None:
    """Request a strict, validated recovery proposal from the LLM.

    Returns ``None`` when the feature is disabled or on any failure
    (missing key, timeout, rate limit, HTTP error, invalid output), so the
    proposal layer always has a deterministic fallback to hand the policy
    engine. Never raises.
    """
    if not is_enabled():
        return None

    config = _config()

    try:
        content = _call_chat_completion(
            api_key=config["api_key"],
            base_url=config["base_url"],
            model=config["model"],
            prompt=build_prompt(payment, diagnosis),
            timeout=config["timeout"],
        )
    except Exception:
        # Provider unavailable / rate limit / timeout / malformed response:
        # deterministic fallback keeps the pipeline fully functional.
        return None

    return parse_structured_output(content)