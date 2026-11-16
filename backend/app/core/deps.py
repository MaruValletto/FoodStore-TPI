from fastapi import Depends, Request, HTTPException
from sqlmodel import Session
from jose import JWTError
from app.core.models import Usuario
from app.core.security import decode_access_token
def get_current_user(request:Request):
    try:
        payload=decode_access_token(request.cookies.get('access_token',''),request.app.state.settings)
        id=int(payload['sub'])
    except (JWTError,ValueError,KeyError,TypeError): raise HTTPException(401,'Sesión inválida o vencida')
    with Session(request.app.state.engine) as session:
        user=session.get(Usuario,id)
        if user is None: raise HTTPException(401,'Sesión inválida o vencida')
        return user
def get_current_active_user(user:Usuario=Depends(get_current_user)):
    if user.disabled: raise HTTPException(400,'Cuenta de usuario desactivada')
    return user
def require_role(roles):
    def dependency(user:Usuario=Depends(get_current_active_user)):
        if user.role not in roles: raise HTTPException(403,'No tenés permiso para esta operación')
        return user
    return dependency
