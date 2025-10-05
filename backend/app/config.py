from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GOOGLE_API_KEY:str
    CHAT_MODEL_NAME:str
    ALLOWED_ORIGIN:str
    USER_PROMPT_LIMIT:int

settings = Settings()