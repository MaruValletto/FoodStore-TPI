from pydantic import Field,model_validator
from app.core.schemas import Schema
class CategoriaCreate(Schema):
    nombre:str=Field(min_length=2,max_length=100)
    descripcion:str=''
class CategoriaUpdate(Schema):
    nombre:str|None=Field(default=None,min_length=2,max_length=100)
    descripcion:str|None=None
    @model_validator(mode='after')
    def not_null(self):
        if any(getattr(self,k) is None for k in self.model_fields_set): raise ValueError('Omití los campos que no querés modificar; no uses null')
        return self
class CategoriaRead(CategoriaCreate):
    id:int
    activo:bool
