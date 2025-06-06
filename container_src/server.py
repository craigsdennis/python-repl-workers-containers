from fastapi import FastAPI, WebSocket, Request, HTTPException
from pydantic import BaseModel
from code import InteractiveConsole
import uuid, io, contextlib, traceback

app = FastAPI()
sessions: dict[str, InteractiveConsole] = {}

# ---------- helpers ----------
class CodeIn(BaseModel):
    code: str

def run_snippet(console: InteractiveConsole, snippet: str) -> dict:
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf), contextlib.redirect_stderr(buf):
            # .push() returns True if statement is *incomplete* (e.g. after "for i in:")
            more = console.push(snippet)
    except Exception:
        traceback.print_exc(file=buf)
        more = False
    output = buf.getvalue()
    return {"stdout": output, "incomplete": more}

# ---------- HTTP endpoints ----------
@app.post("/exec")                        # Level A – stateless
async def exec_once(payload: CodeIn):
    temp_console = InteractiveConsole()   # brand-new every call
    return run_snippet(temp_console, payload.code)

@app.post("/exec/{sid}")                  # Level B – sticky session
async def exec_session(sid: str, payload: CodeIn):
    if sid not in sessions:
        sessions[sid] = InteractiveConsole()
    return run_snippet(sessions[sid], payload.code)

@app.post("/session")                     # helper: create a fresh sid
async def create_session():
    sid = str(uuid.uuid4())
    sessions[sid] = InteractiveConsole()
    return {"session_id": sid}

# ---------- WebSocket endpoint ----------
@app.websocket("/ws")                     # Level C – live REPL
async def repl_socket(ws: WebSocket):
    await ws.accept()
    sid = str(uuid.uuid4())
    console = sessions.setdefault(sid, InteractiveConsole())
    await ws.send_text(f"# Connected. Session = {sid!s}\n")
    while True:
        snippet = await ws.receive_text()
        result = run_snippet(console, snippet)
        await ws.send_text(result["stdout"])
