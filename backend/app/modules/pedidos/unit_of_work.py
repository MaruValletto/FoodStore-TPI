from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository,DetalleRepository
from app.modules.productos.repository import ProductoRepository
class PedidoUoW(UnitOfWork):
    def __enter__(self):
        super().__enter__();self.pedidos=PedidoRepository(self.session);self.detalles=DetalleRepository(self.session);self.productos=ProductoRepository(self.session);return self
