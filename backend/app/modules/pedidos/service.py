from decimal import Decimal
from app.core.models import Pedido,DetallePedido,now
from app.core.errors import NoEncontrado,DomainError
from app.modules.pedidos.schemas import PedidoRead,PedidosPaginados,ResumenPedidos
TRANSICIONES={'PENDIENTE':{'EN_PREPARACION','CANCELADO'},'EN_PREPARACION':{'ENTREGADO','CANCELADO'},'ENTREGADO':set(),'CANCELADO':set()}
class PedidoService:
    def __init__(self,uow): self.uow=uow
    def _get(self,uow,id,user):
        pedido=uow.pedidos.lock(id)
        if pedido is None: raise NoEncontrado('Pedido')
        if user.role!='admin' and pedido.usuario_id!=user.id: raise DomainError('El pedido pertenece a otro usuario',403)
        return pedido
    def crear(self,data,user):
        ids=[x.producto_id for x in data.items]
        if len(ids)!=len(set(ids)): raise DomainError('Un producto no puede repetirse en el pedido')
        with self.uow as uow:
            pedido=uow.pedidos.add(Pedido(usuario_id=user.id,forma_pago=data.forma_pago,direccion_entrega=data.direccion_entrega,notas=data.notas))
            total=Decimal('0.00')
            # Lock products in a deterministic order to avoid deadlocks in concurrent checkouts.
            for item in sorted(data.items,key=lambda x:x.producto_id):
                producto=uow.productos.lock(item.producto_id)
                if producto is None or not producto.activo: raise NoEncontrado('Producto')
                if not producto.disponible: raise DomainError('Producto no disponible')
                if producto.stock<item.cantidad: raise DomainError('Stock insuficiente para '+producto.nombre)
                producto.stock-=item.cantidad;uow.productos.add(producto)
                precio=Decimal(str(producto.precio_base)).quantize(Decimal('.01'))
                subtotal=precio*item.cantidad
                uow.detalles.add(DetallePedido(pedido_id=pedido.id,producto_id=producto.id,cantidad=item.cantidad,nombre_producto=producto.nombre,precio_unitario=float(precio),subtotal=float(subtotal)))
                total+=subtotal
            pedido.total=float(total);uow.pedidos.add(pedido);uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)
    def listar(self,user,skip,limit,estado=None):
        with self.uow as uow:
            total,items=uow.pedidos.get_by_usuario(user,skip,limit,estado)
            return PedidosPaginados(total=total,items=[PedidoRead.model_validate(x) for x in items])
    def obtener(self,id,user):
        with self.uow as uow: return PedidoRead.model_validate(self._get(uow,id,user))
    def cambiar(self,id,estado,user,owner=False):
        with self.uow as uow:
            pedido=self._get(uow,id,user)
            if owner and pedido.usuario_id!=user.id: raise DomainError('El pedido pertenece a otro usuario',403)
            if owner and pedido.estado!='PENDIENTE': raise DomainError('Solo podés cancelar un pedido pendiente')
            if estado not in TRANSICIONES[pedido.estado]: raise DomainError('Transición de estado inválida')
            if estado=='CANCELADO':
                for item in sorted(pedido.items,key=lambda x:x.producto_id):
                    producto=uow.productos.lock(item.producto_id)
                    producto.stock+=item.cantidad;uow.productos.add(producto)
            pedido.estado=estado;pedido.updated_at=now();uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)
    def resumen(self):
        with self.uow as uow: return ResumenPedidos(**uow.pedidos.resumen())
