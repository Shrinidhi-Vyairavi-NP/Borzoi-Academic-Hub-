from fastapi import FastAPI
from pydantic import BaseModel
import subprocess

app = FastAPI(title="Borzoi Strands Decider Microservice")

class DecisionRequest(BaseModel):
    state: str
    choices: str

@app.post("/api/decide")
def decide(req: DecisionRequest):
    try:
        cmd = [
            "strands-decider", "ask",
            "StrandsAgents/strands-decider-2B-hobson-v19",
            "--state", req.state,
            "--choice", f"Categorize message type={req.choices}"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return {"raw_output": result.stdout.strip(), "status": "success"}
    except Exception as e:
        return {"status": "fallback", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)