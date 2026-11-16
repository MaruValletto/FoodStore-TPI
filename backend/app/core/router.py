from fastapi import HTTPException
from app.core.errors import DomainError
def execute(operation,*args,**kwargs):
    try: return operation(*args,**kwargs)
    except DomainError as error: raise HTTPException(error.status,error.detail) from error
