import subprocess
import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "infrawatch running"}

@app.get("/cpu")
def get_cpu_data():
    return _get_collector_data("cpu")

@app.get("/disk")
def get_disk_data():
    return _get_collector_data("disk")

@app.get("/memory")
def get_memory_data():
    return _get_collector_data("memory")

@app.get("/processes")
def get_processes_data():
    return _get_collector_data("processes")


def _get_collector_data(collector: str=None):
    if not collector:
        return {}

    result = subprocess.run(
        [f"./collectors/{collector}.sh"],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return  {"error": f"{collector} collector failed"}

    data = json.loads(result.stdout)
    return data