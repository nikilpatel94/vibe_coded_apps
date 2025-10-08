FROM python:3.9-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN pytest

FROM python:3.9-slim AS runtime

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.9 /usr/local/lib/python3.9
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
