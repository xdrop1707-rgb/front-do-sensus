from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TriagemRequest(BaseModel):
    motivo: str
    prioridade: Optional[str] = "normal"

class TriagemResponse(BaseModel):
    message: str
    triagem_id: str

class TriagemAdminResponse(BaseModel):
    id: str
    data_solicitacao: datetime
    status: str
    motivo: Optional[str]
    prioridade: str
    paciente_nome: str
    paciente_email: str
    paciente_id: str