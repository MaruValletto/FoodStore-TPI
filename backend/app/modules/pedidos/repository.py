from datetime import datetime,timezone,timedelta
from sqlmodel import select
from sqlalchemy import func
from app.core.models import Pedido,DetallePedido
from app.core.base_repository import BaseRepository
class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self,session): super().__init__(session,Pedido)
    def lock(self,id): return self.session.exec(select(Pedido).where(Pedido.id==id).with_for_update()).first()
    def get_by_usuario(self,user,skip,limit,estado=None):
        query=select(Pedido)
        if user.role!='admin': query=query.where(Pedido.usuario_id==user.id)
        if estado: query=query.where(Pedido.estado==estado)
        total=self.session.exec(select(func.count()).select_from(query.subquery())).one()
        return total,self.session.exec(query.order_by(Pedido.id.desc()).offset(skip).limit(limit)).all()
    def resumen(self):
        result={}
        for name,state in [('pendientes','PENDIENTE'),('en_preparacion','EN_PREPARACION'),('entregados','ENTREGADO'),('cancelados','CANCELADO')]:
            result[name]=self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.estado==state)).one()
        start=datetime.now(timezone.utc).replace(hour=0,minute=0,second=0,microsecond=0)
        result['pedidos_hoy']=self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at>=start,Pedido.created_at<start+timedelta(days=1))).one()
        result['ingresos_entregados']=self.session.exec(select(func.coalesce(func.sum(Pedido.total),0)).where(Pedido.estado=='ENTREGADO')).one()
        return result
class DetalleRepository(BaseRepository[DetallePedido]):
    def __init__(self,session): super().__init__(session,DetallePedido)
