from fastapi import APIRouter,Depends,Request,Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.core.router import execute
from app.core.deps import get_current_active_user
from app.modules.auth.service import AuthService
from app.modules.auth.schemas import UserCreate,UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUoW
router=APIRouter(prefix='/auth',tags=['auth'])
def get_auth_service(request:Request): return AuthService(UsuarioUoW(lambda:Session(request.app.state.engine)),request.app.state.settings)
@router.post('/register',response_model=UserPublic,status_code=201)
def register(data:UserCreate,service:AuthService=Depends(get_auth_service)): return execute(service.register,data)
@router.post('/token')
def login(request:Request,response:Response,form:OAuth2PasswordRequestForm=Depends(),service:AuthService=Depends(get_auth_service)):
    token=execute(service.login,form.username,form.password)
    settings=request.app.state.settings
    response.set_cookie('access_token',token,httponly=True,secure=settings.COOKIE_SECURE,samesite='lax',max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES*60,path='/')
    return {'message':'Login exitoso'}
@router.post('/logout')
def logout(response:Response): response.delete_cookie('access_token',path='/');return {'message':'Sesión cerrada'}
@router.get('/me',response_model=UserPublic)
def me(user=Depends(get_current_active_user)): return UserPublic.model_validate(user)
