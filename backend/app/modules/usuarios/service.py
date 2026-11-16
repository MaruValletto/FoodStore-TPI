from app.core.errors import DomainError,NoEncontrado
from app.modules.usuarios.schemas import UserPublic
class UsuarioService:
    def __init__(self,uow): self.uow=uow
    def listar(self):
        with self.uow as uow: return [UserPublic.model_validate(x) for x in uow.usuarios.get_all()]
    def estado(self,id,disabled,actor):
        with self.uow as uow:
            user=uow.usuarios.get_by_id(id)
            if user is None: raise NoEncontrado('Usuario')
            if id==actor.id and disabled: raise DomainError('No podés desactivarte a vos mismo')
            user.disabled=disabled;uow.usuarios.add(user)
            return UserPublic.model_validate(user)
