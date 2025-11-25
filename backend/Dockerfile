FROM python:3.12-slim

WORKDIR /app

# Install system dependencies including jemalloc for better memory management
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    libjemalloc2 \
    && rm -rf /var/lib/apt/lists/*

# Use jemalloc instead of Python's default allocator
ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
