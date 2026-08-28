import json
from pathlib import Path
from typing import Any


SETTINGS_FILE = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "settings.json"
)


DEFAULTS: dict[str, Any] = {
    "retry_limit": 3,
    "cooling_off_hours": 12,
    "human_approval_threshold": 75000,
    "max_contact_attempts": 2,
    "kill_switch": False,
}


def _load() -> dict[str, Any]:
    """Return current settings, falling back to defaults when the file is
    missing or unreadable. Missing files are not created on read; they are
    created the first time settings are saved."""
    if not SETTINGS_FILE.exists():
        return dict(DEFAULTS)

    try:
        with open(SETTINGS_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
    except (json.JSONDecodeError, OSError, ValueError):
        return dict(DEFAULTS)

    if not isinstance(data, dict):
        return dict(DEFAULTS)

    merged = dict(DEFAULTS)
    merged.update(
        {key: data[key] for key in DEFAULTS if key in data}
    )

    return merged


def get_settings() -> dict[str, Any]:
    """Expose the current persisted policy settings."""
    return _load()


def validate(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    retry_limit = data.get("retry_limit")
    if not isinstance(retry_limit, int) or isinstance(retry_limit, bool) or retry_limit < 1:
        errors.append("retry_limit must be an integer >= 1")

    for field, minimum in (
        ("cooling_off_hours", 0),
        ("human_approval_threshold", 0),
        ("max_contact_attempts", 0),
    ):
        value = data.get(field)
        if (
            not isinstance(value, int)
            or isinstance(value, bool)
            or value < minimum
        ):
            errors.append(f"{field} must be an integer >= {minimum}")

    kill_switch = data.get("kill_switch")
    if not isinstance(kill_switch, bool):
        errors.append("kill_switch must be a boolean")

    return errors


def save_settings(data: dict[str, Any]) -> dict[str, Any]:
    """Persist an already-validated settings object and return it."""
    settings = dict(DEFAULTS)
    settings.update(
        {key: data[key] for key in DEFAULTS if key in data}
    )

    SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(SETTINGS_FILE, "w", encoding="utf-8") as file:
        json.dump(settings, file, indent=2)

    return settings
