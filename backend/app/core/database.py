from sqlalchemy import event
from sqlmodel import Session, SQLModel, create_engine
from app.core.config import Settings
from app.core.models import Usuario, Categoria, Producto, Pedido, DetallePedido
def make_engine(url):
    # SQLAlchemy 2.1 defaults to psycopg 3; the assignment requires psycopg2.
    if url.startswith('postgresql://'):
        url=url.replace('postgresql://','postgresql+psycopg2://',1)
    engine=create_engine(url,pool_pre_ping=True,connect_args={'check_same_thread':False} if url.startswith('sqlite') else {})
    if url.startswith('sqlite'):
        @event.listens_for(engine,'connect')
        def enable_fk(conn,_): conn.execute('PRAGMA foreign_keys=ON')
    return engine
engine=make_engine(Settings().DATABASE_URL)
def create_all_tables(engine=engine): SQLModel.metadata.create_all(engine)
def session_factory(): return Session(engine)
