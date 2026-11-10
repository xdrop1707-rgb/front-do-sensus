from pydantic import BaseModel, Field
from typing import Optional, Literal

class ProntuarioRequest(BaseModel):
    id_consulta: str
    prontuario: str
    status_clinico: Optional[str] = "Estável"
    humor_predominante: Optional[str] = "Positivo"
    revisao_medicacao: Optional[bool] = False
    intervencoes: Optional[str] = "Nenhuma"
    plano_proximo: Optional[str] = "Continuar acompanhamento"

class ProntuarioResponse(BaseModel):
    message: str
    prontuario_id: str

class FeedbackRequest(BaseModel):
    id_consulta: str
    assunto: str
    conteudo: str
    tipo: Optional[Literal["feedback", "tarefa", "orientacao", "relatorio", "modelo"]] = Field(
        default="feedback",
        description="Tipo de comunicação: feedback, tarefa, orientacao, relatorio ou modelo"
    )

class FeedbackResponse(BaseModel):
    message: str
    comunicacao_id: str