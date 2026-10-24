import re
import subprocess
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

MODEL = "StrandsAgents/strands-decider-2B-hobson-v19"

# Typed question and options used by the /classify endpoint (the dashboard's live path)
QUESTION = "Is this a class cancellation, an extra class, or general chat?"
OPTIONS = ["CLASS_CANCELLED", "EXTRA_CLASS", "GENERAL_BANTER"]

# Matches the single chosen line, e.g. "choice_0 -> CLASS_CANCELLED (confidence 0.984)"
CHOSEN = re.compile(r"choice_0\s*->\s*([A-Z_]+)\s*\(confidence\s*([0-9.]+)\)")

app = FastAPI(title="Borzoi Strands Decider Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def ask_decider(state: str, question: str, options: list):
    """Run Strands Decider 2B and return (label, confidence, elapsed_ms, raw_output)."""
    cmd = [
        "strands-decider", "ask", MODEL,
        "--state", state,
        "--choice", f"{question}={','.join(options)}",
    ]
    start = time.time()
    result = subprocess.run(cmd, capture_output=True, text=True, check=True, timeout=120)
    elapsed_ms = round((time.time() - start) * 1000, 1)
    match = CHOSEN.search(result.stdout)
    if not match or match.group(1) not in options:
        raise ValueError(f"Unexpected decider output: {result.stdout!r}")
    return match.group(1), float(match.group(2)), elapsed_ms, result.stdout.strip()


def keyword_fallback(text: str):
    """Used ONLY if the Strands Decider cannot run. Clearly labelled as a fallback."""
    t = text.lower()
    if any(k in t for k in ["cancel", "cancelled", "canceled", "postponed", "no class", "suspended"]):
        return "CLASS_CANCELLED"
    if any(k in t for k in ["extra class", "extra session", "rescheduled", "special class", "additional class"]):
        return "EXTRA_CLASS"
    return "GENERAL_BANTER"


# Sync endpoints: FastAPI runs them in a worker thread, so the slow model call doesn't block the server.
@app.post("/classify")
def classify_announcement(payload: dict):
    text = payload.get("text", "")
    try:
        label, confidence, elapsed_ms, _ = ask_decider(text, QUESTION, OPTIONS)
        return {
            "decision": label,
            "confidence": confidence,
            "latency_ms": elapsed_ms,
            "model": MODEL,
            "source": "strands",
        }
    except Exception as e:
        print(f"[decider] Strands Decider failed, using keyword fallback: {e}")
        return {
            "decision": keyword_fallback(text),
            "confidence": 0.0,
            "latency_ms": 0,
            "model": None,
            "source": "keyword-fallback",
        }


class DecisionRequest(BaseModel):
    state: str
    choices: str


@app.post("/api/decide")
def decide(req: DecisionRequest):
    options = [c.strip() for c in req.choices.split(",") if c.strip()]
    try:
        _, _, _, raw = ask_decider(req.state, "What kind of academic message is this?", options)
        return {"raw_output": raw, "status": "success"}
    except Exception as e:
        return {"status": "fallback", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)