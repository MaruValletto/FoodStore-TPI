from fastapi import APIRouter,Depends,Request,Query
from sqlmodel import Session
from app.core.deps import get_current_active_user,require_role
from app.core.router import execute
from app.modules.pedidos.service import PedidoService
from app.modules.pedidos.unit_of_work import PedidoUoW
from app.modules.pedidos.schemas import PedidoCreate,PedidoRead,PedidosPaginados,CambioEstado,ResumenPedidos,EstadoPedido
router=APIRouter(prefix='/pedidos',tags=['pedidos'])
def get_pedidos_service(request:Request): return PedidoService(PedidoUoW(lambda:Session(request.app.state.engine)))
@router.post('',response_model=PedidoRead,status_code=201)
def create(data:PedidoCreate,user=Depends(get_current_active_user),service:PedidoService=Depends(get_pedidos_service)): return execute(service.crear,data,user)
@router.get('',response_model=PedidosPaginados)
def listado(skip:int=Query(0,ge=0),limit:int=Query(20,ge=1,le=100),estado:EstadoPedido|None=None,user=Depends(get_current_active_user),service:PedidoService=Depends(get_pedidos_service)): return execute(service.listar,user,skip,limit,estado)
@router.get('/resumen',response_model=ResumenPedidos)
def resumen(admin=Depends(require_role(['admin'])),service:PedidoService=Depends(get_pedidos_service)): return execute(service.resumen)
@router.get('/{id}',response_model=PedidoRead)
def get(id:int,user=Depends(get_current_active_user),service:PedidoService=Depends(get_pedidos_service)): return execute(service.obtener,id,user)
@router.patch('/{id}/estado',response_model=PedidoRead)
def state(id:int,data:CambioEstado,admin=Depends(require_role(['admin'])),service:PedidoService=Depends(get_pedidos_service)): return execute(service.cambiar,id,data.estado,admin)
@router.patch('/{id}/cancelar',response_model=PedidoRead)
def cancelar(id:int,user=Depends(get_current_active_user),service:PedidoService=Depends(get_pedidos_service)): return execute(service.cambiar,id,'CANCELADO',user,True)
