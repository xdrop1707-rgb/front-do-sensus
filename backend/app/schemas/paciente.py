from pydantic import BaseModel
from typing import Optional

class PacienteResponse(BaseModel):
    id: str
    nome: str
    email: str
    status_tratamento: str