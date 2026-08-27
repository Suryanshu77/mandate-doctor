FAILURE_CATEGORIES = {
    "BALANCE": {
        "description": "Insufficient customer balance",
        "default_action": "RETRY_LATER",
        "recoverability": "HIGH",
    },
    "EXPIRED_MANDATE": {
        "description": "Mandate has expired",
        "default_action": "CUSTOMER_ACTION",
        "recoverability": "LOW",
    },
    "REVOKED": {
        "description": "Customer has revoked the mandate",
        "default_action": "STOP",
        "recoverability": "VERY_LOW",
    },
    "BANK_TIMEOUT": {
        "description": "Temporary bank/network timeout",
        "default_action": "RETRY_LATER",
        "recoverability": "HIGH",
    },
    "LIMIT_EXCEEDED": {
        "description": "Payment or mandate limit exceeded",
        "default_action": "CUSTOMER_ACTION",
        "recoverability": "MEDIUM",
    },
}


FAILURE_REASON_MAPPING = {
    "insufficient_balance": "BALANCE",
    "low_balance": "BALANCE",
    "mandate_expired": "EXPIRED_MANDATE",
    "expired_mandate": "EXPIRED_MANDATE",
    "mandate_revoked": "REVOKED",
    "revoked_mandate": "REVOKED",
    "bank_timeout": "BANK_TIMEOUT",
    "network_timeout": "BANK_TIMEOUT",
    "limit_exceeded": "LIMIT_EXCEEDED",
    "mandate_limit_exceeded": "LIMIT_EXCEEDED",
}