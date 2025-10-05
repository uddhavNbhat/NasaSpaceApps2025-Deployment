from fastapi import FastAPI
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

@app.get("/health")
def health():
    return {"status":"ok"}

#Include endpoint
app.include_router(router)