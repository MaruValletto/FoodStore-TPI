from sqlmodel import select
from sqlalchemy import func
from app.core.models import Usuario
from app.core.base_repository import BaseRepository
class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self,session): super().__init__(session,Usuario)
    def get_by_username(self,value): return self.session.exec(select(Usuario).where(func.lower(Usuario.username)==value.lower())).first()
    def get_by_email(self,value): return self.session.exec(select(Usuario).where(func.lower(Usuario.email)==value.lower())).first()
