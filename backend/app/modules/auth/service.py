from sqlalchemy.exc import IntegrityError
from app.core.models import Usuario
from app.core.errors import DomainError
from app.core.security import hash_password,verify_password,create_access_token
from app.modules.usuarios.schemas import UserPublic
class AuthService:
    def __init__(self,uow,settings): self.uow,self.settings=uow,settings
    def register(self,data):
        try:
            with self.uow as uow:
                if uow.usuarios.get_by_username(data.username) or uow.usuarios.get_by_email(data.email): raise DomainError('El usuario o email ya está registrado',409)
                user=uow.usuarios.add(Usuario(username=data.username.lower(),full_name=data.full_name,email=str(data.email).lower(),hashed_password=hash_password(data.password),role='user'))
                return UserPublic.model_validate(user)
        except IntegrityError: raise DomainError('El usuario o email ya está registrado',409)
    def login(self,username,password):
        with self.uow as uow:
            user=uow.usuarios.get_by_username(username)
            if user is None or not verify_password(password,user.hashed_password): raise DomainError('Credenciales incorrectas',401)
            if user.disabled: raise DomainError('Cuenta de usuario desactivada')
            return create_access_token(user,self.settings)
