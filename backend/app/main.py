from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from app.api.v1 import (
    psicologos, agendamento, triagem,
    consultas, pacientes, dashboard, prontuario
)

security = HTTPBearer()

app = FastAPI(
    title="Sensus API",
    description="Backend da Clínica Psicológica Sensus",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(psicologos.router, prefix="/api/v1", tags=["Psicólogos"])
app.include_router(agendamento.router, prefix="/api/v1", tags=["Agendamento"])
app.include_router(triagem.router, prefix="/api/v1", tags=["Triagem"])
app.include_router(consultas.router, prefix="/api/v1", tags=["Consultas"])
app.include_router(pacientes.router, prefix="/api/v1", tags=["Pacientes"])
app.include_router(dashboard.router, prefix="/api/v1", tags=["Dashboard"])
app.include_router(prontuario.router, prefix="/api/v1", tags=["Prontuário"])

@app.get("/api/v1/teste-auth", dependencies=[Depends(security)])
def teste_auth():
    return {"message": "Autenticado com sucesso"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend Sensus funcionando!"}