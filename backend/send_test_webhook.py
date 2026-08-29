"""Send a Razorpay-compatible, correctly signed webhook to the LOCAL backend.

This is a safe local verification harness. It does NOT call any real
Razorpay API and does NOT require Razorpay dashboard credentials. It
builds a realistic TEST-mode ``payment.failed`` payload, signs it with
the webhook secret using the same HMAC-SHA256 mechanism the server
verifies against, and POSTs it twice to demonstrate idempotency.

Usage (from the backend directory, with the server running on :8000):

    $env:RAZORPAY_WEBHOOK_SECRET = "test_webhook_secret_123"
    python send_test_webhook.py [BASE_URL] [--secret SECRET]
"""

import argparse
import json
import sys

sys.path.insert(0, str(__import__("pathlib").Path(__file__).resolve().parent))

import httpx  # noqa: E402

from app.services import razorpay_webhook as rz  # noqa: E402


def build_payment_failed_payload():
    return {
        "entity": "event",
        "account_id": "acc_localtest_0001",
        "event": "payment.failed",
        "contains": ["payment"],
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_localtest_0001",
                    "entity": "payment",
                    "amount": 1499,
                    "currency": "INR",
                    "status": "failed",
                    "method": "emandate",
                    "error_code": None,
                    "error_description": "The bank reported insufficient funds.",
                    "error_reason": "insufficient balance",
                    "notes": {},
                }
            }
        },
        "created_at": 1768768921,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "base_url",
        nargs="?",
        default="http://127.0.0.1:8000",
        help="Local backend base URL (default http://127.0.0.1:8000)",
    )
    parser.add_argument(
        "--secret",
        default=None,
        help="Webhook secret (overrides RAZORPAY_WEBHOOK_SECRET)",
    )
    args = parser.parse_args()

    secret = args.secret or rz.get_webhook_secret()
    if not secret:
        print(
            "ERROR: No webhook secret configured. "
            "Set RAZORPAY_WEBHOOK_SECRET or pass --secret.",
            file=sys.stderr,
        )
        return 2

    payload = build_payment_failed_payload()
    raw_body = json.dumps(payload).encode("utf-8")
    signature = rz.compute_webhook_signature(raw_body, secret)

    print("Local Razorpay-compatible signed webhook")
    print(f"  event        : {payload['event']}")
    print(f"  payment      : {payload['payload']['payment']['entity']['id']}")
    print(f"  amount (p)   : {payload['payload']['payment']['entity']['amount']}")
    print(f"  signature    : {signature}")
    print(f"  target       : {args.base_url}/api/webhooks/razorpay")
    print()

    headers = {
        "X-Razorpay-Signature": signature,
        "Content-Type": "application/json",
    }

    results = []

    with httpx.Client(base_url=args.base_url, timeout=30) as client:
        for attempt in (1, 2):
            response = client.post(
                "/api/webhooks/razorpay",
                content=raw_body,
                headers=headers,
            )
            results.append(response)
            print(f"--- delivery #{attempt} -> HTTP {response.status_code}")
            print(json.dumps(response.json(), indent=2))
            print()

    processed = [
        res for res in results if res.json().get("processed") is True
    ]
    duplicate = [
        res for res in results if res.json().get("duplicate") is True
    ]

    print("RESULT")
    if processed:
        print("  local Razorpay-compatible signed webhook verified successfully")
    if duplicate:
        print("  redelivery recognized as duplicate (idempotency working)")
    if not processed:
        print("  no webhook was processed successfully", file=sys.stderr)
        return 1

    print()
    print(
        "NOTE: actual Razorpay dashboard webhook delivery was NOT tested "
        "here - it still needs Razorpay dashboard credentials/configuration."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())