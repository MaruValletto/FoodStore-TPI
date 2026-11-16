from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
class CategoriaUoW(UnitOfWork):
    def __enter__(self): super().__enter__();self.categorias=CategoriaRepository(self.session);return self
