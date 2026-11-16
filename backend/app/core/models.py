from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
def now(): return datetime.now(timezone.utc)

class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: str = 'user'
    disabled: bool = False
    created_at: datetime = Field(default_factory=now)
    pedidos: list['Pedido'] = Relationship(back_populates='usuario')

class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: str = ''
    activo: bool = True
    productos: list['Producto'] = Relationship(back_populates='categoria')

class Producto(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key='categoria.id', index=True)
    nombre: str = Field(index=True)
    descripcion: str = ''
    precio_base: float
    imagen_url: str = ''
    stock: int = 0
    disponible: bool = True
    activo: bool = True
    categoria: Categoria = Relationship(back_populates='productos')
    detalles: list['DetallePedido'] = Relationship(back_populates='producto')

class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key='usuario.id', index=True)
    estado: str = Field(default='PENDIENTE', index=True)
    forma_pago: str
    direccion_entrega: str
    notas: str = ''
    total: float = 0
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)
    usuario: Usuario = Relationship(back_populates='pedidos')
    items: list['DetallePedido'] = Relationship(back_populates='pedido')

class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key='pedido.id', index=True)
    producto_id: int = Field(foreign_key='producto.id')
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float
    pedido: Pedido = Relationship(back_populates='items')
    producto: Producto = Relationship(back_populates='detalles')
