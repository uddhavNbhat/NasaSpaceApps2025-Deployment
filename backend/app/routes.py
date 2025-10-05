from fastapi import APIRouter, HTTPException, Request, status
from app.payload import Payload
from app.utils.genai import GenModel
from app.config import settings
from collections import defaultdict, deque
import time

router = APIRouter()

# Simple in-memory rate limiter (per-IP)
WINDOW_SECONDS = 60
_rate_store: dict[str, deque] = defaultdict(lambda: deque())


@router.post("/api/summarize", status_code=200)
def summarize(payload: Payload, request: Request):
    # Identify client IP (prefer X-Forwarded-For if behind proxy)
    xff = request.headers.get("x-forwarded-for")
    if xff:
        client_ip = xff.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"

    now = time.time()
    dq = _rate_store[client_ip]
    # remove old timestamps
    while dq and now - dq[0] > WINDOW_SECONDS:
        dq.popleft()

    if len(dq) >= settings.USER_PROMPT_LIMIT:
        # Rate limit exceeded
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                            detail=f"Rate limit exceeded: max {settings.USER_PROMPT_LIMIT} requests per {WINDOW_SECONDS} seconds")

    # record this request
    dq.append(now)

    try:
        model = GenModel()
        question = payload.question
        context = payload.context

        final_context = f"""
            Title: {context.get('Title')},\n
            Abstract: {context.get('Abstract')},\n
            Link: {context.get('Link')}
        """

        response = model.invoke_model(user_query=question, context=final_context)
        return {"content": response}

    except HTTPException:
        # propagate HTTP exceptions
        raise
    except Exception as e:
        # log if you have logging; return 500 to client
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


