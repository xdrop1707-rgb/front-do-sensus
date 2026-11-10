from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConsultaResponse(BaseModel):
    id: str
    data_hora_consulta: datetime
    status: str
    modalidade: str
    observacoes: Optional[str]
    psicologo_nome: str
    psicologo_especialidade: str
    valor_total: Optional[float]
    status_pagamento: Optional[str]