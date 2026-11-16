from datetime import datetime
from pydantic import EmailStr, Field, field_validator
from app.core.schemas import Schema
class UserCreate(Schema):
    username: str=Field(min_length=3,max_length=60)
    full_name: str=Field(min_length=2,max_length=120)
    email: EmailStr
    password: str=Field(min_length=8,max_length=72)
    @field_validator('password')
    @classmethod
    def byte_limit(cls,value):
        if len(value.encode('utf-8'))>72: raise ValueError('La contraseña admite hasta 72 bytes')
        return value
class UserPublic(Schema):
    id:int
    username:str
    full_name:str
    email:str
    role:str
    disabled:bool
    created_at:datetime
