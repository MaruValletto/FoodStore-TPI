from datetime import datetime, timezone, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
pwd=CryptContext(schemes=['bcrypt'],deprecated='auto')
def hash_password(password): return pwd.hash(password)
def verify_password(password,hashed):
    try: return pwd.verify(password,hashed)
    except (ValueError,TypeError): return False
def create_access_token(user,settings):
    return jwt.encode({'sub':str(user.id),'exp':datetime.now(timezone.utc)+timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)},settings.SECRET_KEY,algorithm=settings.ALGORITHM)
def decode_access_token(token,settings): return jwt.decode(token,settings.SECRET_KEY,algorithms=[settings.ALGORITHM])
