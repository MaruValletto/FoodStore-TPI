from sqlmodel import SQLModel
from pydantic import ConfigDict
class Schema(SQLModel):
    model_config=ConfigDict(extra='forbid',from_attributes=True,str_strip_whitespace=True)
