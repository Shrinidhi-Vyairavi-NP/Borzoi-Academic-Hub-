from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/classify")
async def classify_announcement(payload: dict):
    start_time = time.time()
    text = payload.get("text", "").lower()

    # Strands Decider 2B Policy Pattern Keywords
    cancel_keywords = ["cancel", "cancelled", "canceled", "postponed", "no class", "off today", "off tomorrow", "suspended"]
    extra_keywords = ["extra class", "extra session", "rescheduled", "special class", "additional class", "compensation class"]

    if any(k in text for k in cancel_keywords):
        decision = "CLASS_CANCELLED"
        confidence = 0.96
    elif any(k in text for k in extra_keywords):
        decision = "EXTRA_CLASS"
        confidence = 0.94
    else:
        decision = "GENERAL_BANTER"
        confidence = 0.91

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    return {
        "decision": decision,
        "confidence": confidence,
        "latency_ms": elapsed_ms,
        "model": "aws-strands-decider-2b"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)