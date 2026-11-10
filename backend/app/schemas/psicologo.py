from pydantic import BaseModel
from uuid import UUID

class PsicologoResponse(BaseModel):
    id: UUID
    nome: str
    especialidade: str
    valor_consulta: float
    campus: str | None
    sala: str | None
    foto_url: str | None