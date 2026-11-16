class DomainError(Exception):
    def __init__(self,detail,status=400): self.detail,self.status=detail,status;super().__init__(detail)
class NoEncontrado(DomainError):
    def __init__(self,entity): super().__init__(entity+' inexistente',404)
class NombreDuplicado(DomainError):
    def __init__(self): super().__init__('El nombre ya está registrado',409)
