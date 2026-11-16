from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import Settings
from app.core.database import make_engine,create_all_tables
from app.modules.auth.router import router as auth
from app.modules.usuarios.router import router as usuarios
from app.modules.categorias.router import router as categorias
from app.modules.productos.router import router as productos
from app.modules.pedidos.router import router as pedidos
def create_app(database_url=None,settings=None):
    settings=settings or Settings()
    database=make_engine(database_url or settings.DATABASE_URL)
    @asynccontextmanager
    async def lifespan(app):
        create_all_tables(database);yield;database.dispose()
    app=FastAPI(title='FoodStore · TPI Programación IV',version='1.0.0',lifespan=lifespan)
    app.state.engine=database;app.state.settings=settings
    app.add_middleware(CORSMiddleware,allow_origins=[settings.FRONTEND_ORIGIN],allow_credentials=True,allow_methods=['GET','POST','PUT','PATCH','DELETE'],allow_headers=['Content-Type'])
    for router in (auth,usuarios,categorias,productos,pedidos): app.include_router(router,prefix='/api/v1')
    app.mount('/media',StaticFiles(directory=Path(__file__).resolve().parents[1]/'static/foodstore'),name='media')
    return app
app=create_app()
