import json
from pathlib import Path
from sqlmodel import Session,select
from app.core.models import Usuario,Categoria,Producto
from app.core.security import hash_password
from app.core.database import engine,create_all_tables
def seed(database=engine):
    create_all_tables(database)
    with Session(database) as session:
        if session.exec(select(Usuario).where(Usuario.username=='admin')).first() is None:
            session.add(Usuario(username='admin',full_name='Administración FoodStore',email='admin@foodstore.test',hashed_password=hash_password('Admin1234!'),role='admin'))
        catalog=json.loads((Path(__file__).parent/'catalogo.json').read_text(encoding='utf-8'))
        for data in catalog['categorias']:
            if session.exec(select(Categoria).where(Categoria.nombre==data['nombre'])).first() is None: session.add(Categoria(**data))
        session.flush()
        for data in catalog['productos']:
            if session.exec(select(Producto).where(Producto.nombre==data['nombre'])).first() is not None: continue
            cat=session.exec(select(Categoria).where(Categoria.nombre==data['categorias'][0])).one()
            session.add(Producto(nombre=data['nombre'],descripcion=data['descripcion'],precio_base=float(data['precio_base']),imagen_url=data['imagen_url'][0],categoria_id=cat.id,stock=30,disponible=data['disponible']))
        session.commit()
if __name__=='__main__': seed();print('Seed completado: admin, categorías y productos.')
