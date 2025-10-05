from pydantic import BaseModel

class Payload(BaseModel):
    question:str
    context:dict