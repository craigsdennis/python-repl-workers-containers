FROM python:3.12-slim

# Environment hygiene
ENV PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy and install deps
COPY container_src/requirements.txt .
RUN pip install --upgrade pip \
 && pip install -r requirements.txt

# Copy server code
COPY container_src/server.py .

# Expose the port you want the app to bind to
EXPOSE 8080

# Start Uvicorn via Python’s module runner (works regardless of PATH)
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8080"]
