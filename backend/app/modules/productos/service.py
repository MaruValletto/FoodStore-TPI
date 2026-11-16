from app.core.models import Producto
from app.core.errors import NoEncontrado
from app.modules.productos.schemas import ProductoRead,ProductosPaginados
class ProductoService:
    def __init__(self,uow): self.uow=uow
    def _get(self,uow,id):
        item=uow.productos.lock(id)
        if item is None or not item.activo: raise NoEncontrado('Producto')
        return item
    def listar(self,**filters):
        with self.uow as uow:
            total,items=uow.productos.get_filtered(**filters)
            return ProductosPaginados(total=total,items=[ProductoRead.model_validate(x) for x in items])
    def obtener(self,id):
        with self.uow as uow: return ProductoRead.model_validate(self._get(uow,id))
    def guardar(self,data,id=None):
        with self.uow as uow:
            item=self._get(uow,id) if id else Producto(**data.model_dump())
            if data.categoria_id is not None:
                cat=uow.categorias.get_by_id(data.categoria_id)
                if cat is None or not cat.activo: raise NoEncontrado('Categoría')
            for k,v in data.model_dump(exclude_unset=True).items(): setattr(item,k,v)
            uow.productos.add(item);uow.session.refresh(item)
            return ProductoRead.model_validate(item)
    def stock(self,id,data):
        with self.uow as uow:
            item=self._get(uow,id)
            item.stock,item.disponible=data.stock,data.disponible
            uow.productos.add(item);return ProductoRead.model_validate(item)
    def eliminar(self,id):
        with self.uow as uow:
            item=self._get(uow,id);item.activo=False;uow.productos.add(item)
