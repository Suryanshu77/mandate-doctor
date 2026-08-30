"""Hermetic pytest environment.

The unit/evaluation suite must be deterministic and must never require a
live LLM or network connection, regardless of whether an ``LLM_API_KEY``
happens to be configured in ``backend/.env``. This autouse fixture keeps
that contract: every test runs with the LLM proposal layer disabled, so
``make_recovery_decision(...)`` (default ``use_llm``) resolves to the
deterministic proposal path — exactly as it did before an API key existed.

The live LLM path is NOT covered here and is unaffected by this file:
- webhook ingestion and ``POST /api/recovery/decision`` on a running
  server still consult the LLM when ``AI_PROPOSAL_ENABLED`` + ``LLM_API_KEY``
  are configured for the process;
- ``test_llm_proposal.py`` explicitly re-enables the key (and stubs the
  network) for its focused cases;
- the manual ``test_llm_app.py`` script exercises the real Gemini call.
"""

import pytest


@pytest.fixture(autouse=True)
def _no_live_llm(monkeypatch):
    """Disable the live LLM for the whole suite (process-wide, env only)."""
    monkeypatch.delenv("LLM_API_KEY", raising=False)
    monkeypatch.setenv("AI_PROPOSAL_ENABLED", "false")
    monkeypatch.delenv("LLM_MODEL", raising=False)
    monkeypatch.delenv("LLM_BASE_URL", raising=False)