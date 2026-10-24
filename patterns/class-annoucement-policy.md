# Decision pattern: Class Announcement Policy (`#policy`)

A reusable Strands Decider 2B pattern that classifies an incoming chat message into a category **before** the agent acts on it. Drop it in front of any agent that watches a noisy stream (group chats, support inboxes, email) where only a small fraction of messages matter.

## The decision

| | |
|---|---|
| **Pattern** | `#policy`: classify an incoming request into a category before the agent acts |
| **Decider model** | `StrandsAgents/strands-decider-2B-hobson-v19` |
| **State** | The raw message text |
| **Typed question** | `Is this a class cancellation, an extra class, or general chat?` |
| **Option set** | `CLASS_CANCELLED`, `EXTRA_CLASS`, `GENERAL_BANTER` |
| **Output** | One chosen option plus a confidence between 0 and 1 |

## Why a decider here

A class group chat is mostly banter, and the decision repeats on every message. A decision model returns a single choice with a confidence and generates no text, so it is a good fit for a repeated gate that runs before anything slower or more expensive (a state change, an LLM call).

## How it is wired in

```
chat message ──► decider (typed question + options)
                      │
        ┌─────────────┼───────────────────┐
        ▼             ▼                   ▼
  CLASS_CANCELLED  EXTRA_CLASS      GENERAL_BANTER
        │             │                   │
        └──► suggest to the user          └──► ignore (no state change,
             (user confirms before             no generative call)
              any record changes)
```

1. The bot forwards each message to the decider.
2. `GENERAL_BANTER` stops here: nothing runs, nothing is stored.
3. `CLASS_CANCELLED` or `EXTRA_CLASS` becomes a **suggestion** shown to the user. The record only changes after the user confirms.
4. If the decider is not running, the caller falls back to a general LLM and labels the result with the source that made the decision.

## Calling it

The decider ships a command-line tool (`pip install strands-decider`). The model weights download from Hugging Face on first use.

```python
import re
import subprocess

MODEL = "StrandsAgents/strands-decider-2B-hobson-v19"
QUESTION = "Is this a class cancellation, an extra class, or general chat?"
OPTIONS = ["CLASS_CANCELLED", "EXTRA_CLASS", "GENERAL_BANTER"]

def classify(message: str):
    cmd = [
        "strands-decider", "ask", MODEL,
        "--state", message,
        "--choice", f"{QUESTION}={','.join(OPTIONS)}",
    ]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    match = re.search(r"choice_0 -> (\w+) \(confidence ([0-9.]+)\)", out)
    if not match:
        raise ValueError(f"Unexpected decider output: {out!r}")
    return match.group(1), float(match.group(2))
```

Example run:

```
> strands-decider ask StrandsAgents/strands-decider-2B-hobson-v19 \
    --state "Tomorrow's DAA class is cancelled" \
    --choice "Is this a class cancellation, an extra class, or general chat?=CLASS_CANCELLED,EXTRA_CLASS,GENERAL_BANTER"

choice_0 -> CLASS_CANCELLED (confidence 0.984)
    CLASS_CANCELLED          0.989
    EXTRA_CLASS              0.007
    GENERAL_BANTER           0.004
```

**Performance note:** `ask` loads the model on every call, which is slow. For a live bot, run the decider as a long-lived server (`strands-decider serve ...`) and send requests to it, so the model loads once.

## Using the confidence

Treat the confidence as a dial, not a verdict. A sensible starting rule (tune it on your own messages):

- High confidence on `CLASS_CANCELLED` or `EXTRA_CLASS`: show a suggestion to confirm.
- Low confidence on any option: show it as "maybe an announcement" or skip it.
- `GENERAL_BANTER`: ignore.

## Reusing the pattern

Swap the question and options, keep the wiring. For example:

| Use case | Typed question | Options |
|---|---|---|
| Assignment alerts | Does this message announce a deadline or assignment? | `DEADLINE`, `NEW_ASSIGNMENT`, `NOT_RELEVANT` |
| Exam changes | Does this message change an exam date or venue? | `DATE_CHANGE`, `VENUE_CHANGE`, `NO_CHANGE` |
| Support inbox | Which team should handle this message? | `BILLING`, `TECHNICAL`, `GENERAL` |

## Tips

- Keep the question simple and make the obvious reading the one you intend. The model leans heavily on the option names, so make them clear and distinct.
- Always keep a catch-all option (like `GENERAL_BANTER`) so ordinary messages have somewhere to go.
- Keep a human in the loop for anything that changes a record. A classifier can be wrong on sarcasm, mixed-language messages and jokes.

## Limitations

- Tested on short English chat messages, so sarcasm, slang and code-mixed text can be misread.
- The decider is an experimental model, so keep a confirmation step for anything that matters.