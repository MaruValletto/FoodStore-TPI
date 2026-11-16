from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository
class UsuarioUoW(UnitOfWork):
    def __enter__(self): super().__enter__();self.usuarios=UsuarioRepository(self.session);return self
