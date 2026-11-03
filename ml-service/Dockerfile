
# Stage 1: Build Python dependencies
FROM python:3.10-slim AS builder

WORKDIR /app

# Create an isolated Python environment
RUN python -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .

# Install application dependencies and security updates
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir --upgrade \
       "setuptools>=78.1.1" \
       "msgpack>=1.2.3" \
       "urllib3>=2.8.0" \
    && rm -rf /root/.cache/pip

# Remove pip from the environment copied to the runtime stage
RUN rm -rf /opt/venv/lib/python3.10/site-packages/pip \
           /opt/venv/lib/python3.10/site-packages/pip-*.dist-info \
           /opt/venv/bin/pip*

# Stage 2: Final runtime image
FROM python:3.10-slim AS runtime

WORKDIR /app

ENV VIRTUAL_ENV=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Apply available Debian security updates
RUN apt-get update \
    && apt-get upgrade -y \
    && /usr/local/bin/python -m pip uninstall -y pip setuptools wheel \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
# Copy only the installed Python environment
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY main.py .

# Create non-root user and remove unnecessary SUID permissions
RUN useradd --create-home appuser \
    && chmod u-s /usr/bin/mount /usr/bin/umount

USER appuser

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
