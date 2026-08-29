# Backend runtime image for Mandate Doctor (FastAPI / uvicorn).
#
# Build context is the repository ROOT (so both the seed dataset under
# ./data and the ./backend app are available). See docker-compose.yml.
FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# Seed dataset + generator (read-only source data).
COPY data ./data

# Backend application.
COPY backend ./backend

WORKDIR /app/backend

# Backend Python dependencies.
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

# Backend healthcheck against its own /health endpoint (stdlib only).
HEALTHCHECK --interval=10s --timeout=5s --start-period=25s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3)"

# Start the FastAPI app. Runtime state (settings.json, audit_logs.json,
# webhook_events.json) lives under /app/backend/data, which is a named
# volume in docker-compose so it persists across restarts.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
