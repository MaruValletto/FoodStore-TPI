from fastapi import APIRouter,Depends,Request,Response,Query
from sqlmodel import Session
from app.core.deps import require_role
from app.core.router import execute
from app.modules.productos.schemas import ProductoCreate,ProductoUpdate,ProductoRead,ProductosPaginados,ProductoStockUpdate
from app.modules.productos.service import ProductoService
from app.modules.productos.unit_of_work import ProductoUoW
router=APIRouter(prefix='/productos',tags=['productos'])
def get_productos_service(request:Request): return ProductoService(ProductoUoW(lambda:Session(request.app.state.engine)))
@router.get('',response_model=ProductosPaginados)
def listado(service:ProductoService=Depends(get_productos_service),skip:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=100),search:str|None=None,categoria_id:int|None=None,disponible:bool|None=None):
    return execute(service.listar, skip=skip,limit=limit,search=search,categoria_id=categoria_id,disponible=disponible)
@router.get('/{id}',response_model=ProductoRead)
def get(id:int,service:ProductoService=Depends(get_productos_service)): return execute(service.obtener,id)
@router.post('',response_model=ProductoRead,status_code=201)
def create(data:ProductoCreate,admin=Depends(require_role(['admin'])),service:ProductoService=Depends(get_productos_service)): return execute(service.guardar,data)
@router.put('/{id}',response_model=ProductoRead)
def update(id:int,data:ProductoUpdate,admin=Depends(require_role(['admin'])),service:ProductoService=Depends(get_productos_service)): return execute(service.guardar,data,id)
@router.delete('/{id}',status_code=204)
def delete(id:int,admin=Depends(require_role(['admin'])),service:ProductoService=Depends(get_productos_service)):
    execute(service.eliminar,id);return Response(status_code=204)

@router.patch('/{id}/stock',response_model=ProductoRead)
def stock(id:int,data:ProductoStockUpdate,admin=Depends(require_role(['admin'])),service:ProductoService=Depends(get_productos_service)): return execute(service.stock,id,data)
