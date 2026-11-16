from fastapi import APIRouter,Depends,Request
from sqlmodel import Session
from app.core.deps import require_role
from app.core.router import execute
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUoW
from app.modules.usuarios.schemas import UserPublic
router=APIRouter(prefix='/admin/usuarios',tags=['usuarios'])
def get_usuarios_service(request:Request): return UsuarioService(UsuarioUoW(lambda:Session(request.app.state.engine)))
@router.get('',response_model=list[UserPublic])
def listado(admin=Depends(require_role(['admin'])),service:UsuarioService=Depends(get_usuarios_service)): return execute(service.listar)
@router.post('/{id}/activar',response_model=UserPublic)
def activar(id:int,admin=Depends(require_role(['admin'])),service:UsuarioService=Depends(get_usuarios_service)): return execute(service.estado,id,False,admin)
@router.post('/{id}/desactivar',response_model=UserPublic)
def desactivar(id:int,admin=Depends(require_role(['admin'])),service:UsuarioService=Depends(get_usuarios_service)): return execute(service.estado,id,True,admin)
