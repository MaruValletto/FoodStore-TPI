from sqlmodel import select
from sqlalchemy import func
from app.core.models import Categoria
from app.core.base_repository import BaseRepository
class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self,session): super().__init__(session,Categoria)
    def get_by_nombre(self,nombre): return self.session.exec(select(Categoria).where(func.lower(Categoria.nombre)==nombre.lower())).first()
    def active(self): return self.session.exec(select(Categoria).where(Categoria.activo==True).order_by(Categoria.id)).all()
