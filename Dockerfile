# ---- build stage -----------------------------------------------------------
FROM python:3.12-slim AS builder

# Faster installs & deterministic wheels
ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_VERSION=0

WORKDIR /app
COPY container_src/requirements.txt .
RUN pip install --upgrade pip \
 && pip wheel --wheel-dir /wheels -r requirements.txt

# ---- runtime stage ---------------------------------------------------------
FROM python:3.12-slim

# Create a non-root user (good practice for containers)
RUN adduser --disabled-password --gecos "" appuser
USER appuser

WORKDIR /app
COPY --from=builder /wheels /wheels
COPY --from=builder /usr/local/lib/python*/distutils /usr/local/lib/python*/distutils
RUN pip install --no-index --find-links=/wheels fastapi uvicorn[standard]

# Copy your server code
COPY contaner_src/server.py .

# Default port FastAPI examples use
EXPOSE 8000

# Start Uvicorn with hot-reloading in DEV mode; tweak as needed
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
