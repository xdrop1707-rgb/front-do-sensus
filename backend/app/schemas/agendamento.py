from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional

class AgendamentoRequest(BaseModel):
    id_psicologo: UUID
    data_hora_consulta: datetime
    modalidade: str = "presencial"
    observacoes: Optional[str] = None

class AgendamentoResponse(BaseModel):
    message: str
    consulta_id: UUID