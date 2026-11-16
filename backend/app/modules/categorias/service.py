from app.core.models import Categoria
from app.core.errors import NoEncontrado,NombreDuplicado
from app.modules.categorias.schemas import CategoriaRead
class CategoriaService:
    def __init__(self,uow): self.uow=uow
    def _get(self,uow,id):
        item=uow.categorias.get_by_id(id)
        if item is None or not item.activo: raise NoEncontrado('Categoría')
        return item
    def listar(self):
        with self.uow as uow: return [CategoriaRead.model_validate(x) for x in uow.categorias.active()]
    def obtener(self,id):
        with self.uow as uow: return CategoriaRead.model_validate(self._get(uow,id))
    def guardar(self,data,id=None):
        with self.uow as uow:
            item=self._get(uow,id) if id else Categoria(nombre=data.nombre)
            if data.nombre is not None:
                other=uow.categorias.get_by_nombre(data.nombre)
                if other and other.id!=id: raise NombreDuplicado()
            for k,v in data.model_dump(exclude_unset=True).items(): setattr(item,k,v)
            uow.categorias.add(item);return CategoriaRead.model_validate(item)
    def eliminar(self,id):
        with self.uow as uow:
            item=self._get(uow,id);item.activo=False;uow.categorias.add(item)
