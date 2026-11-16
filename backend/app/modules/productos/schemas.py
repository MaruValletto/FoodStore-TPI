from pydantic import Field,model_validator
from app.core.schemas import Schema
from app.modules.categorias.schemas import CategoriaRead
class ProductoCreate(Schema):
    nombre:str=Field(min_length=1,max_length=150)
    descripcion:str=''
    precio_base:float=Field(ge=0,allow_inf_nan=False)
    imagen_url:str=''
    stock:int=Field(default=0,ge=0,strict=True)
    disponible:bool=True
    categoria_id:int=Field(gt=0)
class ProductoUpdate(Schema):
    nombre:str|None=Field(default=None,min_length=1,max_length=150)
    descripcion:str|None=None
    precio_base:float|None=Field(default=None,ge=0,allow_inf_nan=False)
    imagen_url:str|None=None
    stock:int|None=Field(default=None,ge=0,strict=True)
    disponible:bool|None=None
    categoria_id:int|None=Field(default=None,gt=0)
    @model_validator(mode='after')
    def not_null(self):
        if any(getattr(self,k) is None for k in self.model_fields_set): raise ValueError('Omití los campos que no querés modificar; no uses null')
        return self
class ProductoStockUpdate(Schema):
    stock:int=Field(ge=0,strict=True)
    disponible:bool
class ProductoRead(ProductoCreate):
    id:int
    activo:bool
    categoria:CategoriaRead
class ProductosPaginados(Schema):
    total:int
    items:list[ProductoRead]
