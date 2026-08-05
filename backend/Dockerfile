FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for psycopg2 and networking)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 8000

# Health check (PORT falls back to 8000 to match docker-compose; platforms
# like Render that inject their own PORT are covered too)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import os, urllib.request; urllib.request.urlopen('http://localhost:' + os.getenv('PORT', '8000') + '/health')" || exit 1

# Run startup script (seed database + start server)
CMD ["/bin/bash", "start.sh"]
