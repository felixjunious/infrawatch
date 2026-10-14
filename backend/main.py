import subprocess
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent.parent
COLLECTORS_DIR = BASE_DIR / "collectors"


class CPUMetrics(BaseModel):
    cpu_percent: float

class DiskMetrics(BaseModel):
    total_gb: int
    used_gb: int
    percent: float

class MemoryMetrics(BaseModel):
    total_mb: int
    used_mb: int
    percent: float

class ProcessInfo(BaseModel):
    pid: int
    name: str
    cpu:float
    mem: float


async def run_collector(name: str) -> dict:
    
    script = COLLECTORS_DIR / f"{name}.sh"

    try:
        result = subprocess.run(
            [script], capture_output=True, text=True, timeout=5
        )

        if result.returncode != 0:
            logger.error(f"{name} collector failed: {result.stderr}")
            raise HTTPException(status_code=500, detail=f"{name} collector failed")
        return json.loads(result.stdout)

    except json.JSONDecodeError as e:
        logger.error(f"{name} returned invalid JSON: {e}")
        raise HTTPException(status_code=500, detail=f"{name} returned invalid JSON")

    except subprocess.TimeoutExpired:
        logger.error(f"{name} collector timed out")
        raise HTTPException(status_code=500, detail=f"{name} timed out")

@app.get("/")
async def root():
    return {"status": "infrawatch running"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/cpu", response_model=CPUMetrics)
async def get_cpu():
    return await run_collector("cpu")

@app.get("/memory", response_model=MemoryMetrics)
async def get_memory():
    return await run_collector("memory")

@app.get("/disk", response_model=DiskMetrics)
async def get_disk():
    return await run_collector("disk")

@app.get("/processes", response_model=list[ProcessInfo])
async def get_processes():
    return await run_collector("processes")


