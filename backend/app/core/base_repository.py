from typing import Generic, TypeVar
from sqlmodel import SQLModel, select
T=TypeVar('T',bound=SQLModel)
class BaseRepository(Generic[T]):
    def __init__(self,session,model): self.session,self.model=session,model
    def get_by_id(self,id): return self.session.get(self.model,id)
    def get_all(self): return self.session.exec(select(self.model).order_by(self.model.id)).all()
    def add(self,item):
        self.session.add(item);self.session.flush();return item
    def delete(self,item): self.session.delete(item);self.session.flush()
