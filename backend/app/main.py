from fastapi import FastAPI,Request,HTTPException
from app.routes import router
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [
    settings.ALLOWED_ORIGIN
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.middleware("http")
async def restrict_origins(request:Request,call_next):
    allowed_origins = [settings.ALLOWED_ORIGIN]
    origin = request.headers.get("origin")

    if origin and origin not in allowed_origins:
        raise HTTPException(status_code=403, detail="Origin not allowed!")
    
    return await call_next(request)

@app.get("/health")
def health():
    return {"status":"ok"}

#Include endpoint
app.include_router(router)