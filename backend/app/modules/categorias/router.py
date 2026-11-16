from fastapi import APIRouter,Depends,Request,Response,Query
from sqlmodel import Session
from app.core.deps import require_role
from app.core.router import execute
from app.modules.categorias.schemas import CategoriaCreate,CategoriaUpdate,CategoriaRead
from app.modules.categorias.service import CategoriaService
from app.modules.categorias.unit_of_work import CategoriaUoW
router=APIRouter(prefix='/categorias',tags=['categorias'])
def get_categorias_service(request:Request): return CategoriaService(CategoriaUoW(lambda:Session(request.app.state.engine)))
@router.get('',response_model=list[CategoriaRead])
def listado(service:CategoriaService=Depends(get_categorias_service)):
    return execute(service.listar)
@router.get('/{id}',response_model=CategoriaRead)
def get(id:int,service:CategoriaService=Depends(get_categorias_service)): return execute(service.obtener,id)
@router.post('',response_model=CategoriaRead,status_code=201)
def create(data:CategoriaCreate,admin=Depends(require_role(['admin'])),service:CategoriaService=Depends(get_categorias_service)): return execute(service.guardar,data)
@router.put('/{id}',response_model=CategoriaRead)
def update(id:int,data:CategoriaUpdate,admin=Depends(require_role(['admin'])),service:CategoriaService=Depends(get_categorias_service)): return execute(service.guardar,data,id)
@router.delete('/{id}',status_code=204)
def delete(id:int,admin=Depends(require_role(['admin'])),service:CategoriaService=Depends(get_categorias_service)):
    execute(service.eliminar,id);return Response(status_code=204)
