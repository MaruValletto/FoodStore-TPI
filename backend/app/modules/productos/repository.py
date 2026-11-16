from sqlmodel import select
from sqlalchemy import func
from app.core.models import Producto
from app.core.base_repository import BaseRepository
class ProductoRepository(BaseRepository[Producto]):
    def __init__(self,session): super().__init__(session,Producto)
    def lock(self,id): return self.session.exec(select(Producto).where(Producto.id==id).with_for_update()).first()
    def get_filtered(self,skip,limit,search=None,categoria_id=None,disponible=None):
        query=select(Producto).where(Producto.activo==True)
        if search: query=query.where(Producto.nombre.icontains(search.strip(),autoescape=True))
        if categoria_id is not None: query=query.where(Producto.categoria_id==categoria_id)
        if disponible is not None: query=query.where(Producto.disponible==disponible)
        total=self.session.exec(select(func.count()).select_from(query.subquery())).one()
        return total,self.session.exec(query.order_by(Producto.id).offset(skip).limit(limit)).all()
