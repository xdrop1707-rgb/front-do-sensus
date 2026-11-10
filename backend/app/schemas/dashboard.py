from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ProximaConsulta(BaseModel):
    id: str
    hora: str
    paciente: str

class DashboardResponse(BaseModel):
    totalPacientes: int
    triagensPendentes: int
    sessoesHoje: int
    proximasConsultas: List[ProximaConsulta]