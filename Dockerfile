FROM python:3.21-slim

WORKDIR /app


RUN apt-get update && apt-get install -y bc procps && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY collectors/ ./collectors/
COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN chmod +x ./collectors/*.sh

EXPOSE 8080

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]