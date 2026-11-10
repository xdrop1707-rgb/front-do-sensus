from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_supabase_client
from app.schemas.agendamento import AgendamentoRequest, AgendamentoResponse
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.post("/agendar", response_model=AgendamentoResponse, dependencies=[Depends(security)])
async def agendar_consulta(
    dados: AgendamentoRequest,
    authorization: Optional[str] = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de autenticação não fornecido")

    try:
        token = authorization.replace("Bearer ", "")
        supabase_user = get_supabase_client(access_token=token)

        user_response = supabase_user.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Usuário não autenticado")

        user_id = user_response.user.id

        usuario_response = supabase_user.table("usuarios").select("id").eq("auth_user_id", user_id).execute()
        if not usuario_response.data:
            raise HTTPException(status_code=404, detail="Perfil de usuário não encontrado")

        usuario_id = usuario_response.data[0]["id"]

        cliente_response = supabase_user.table("clientes").select("id").eq("id_usuario", usuario_id).execute()
        if not cliente_response.data:
            raise HTTPException(status_code=404, detail="Cliente não encontrado")

        cliente_id = cliente_response.data[0]["id"]

        response = supabase_user.rpc(
            "sp_agendar_consulta",
            {
                "p_id_cliente": cliente_id,
                "p_id_psicologo": str(dados.id_psicologo),
                "p_data_hora": dados.data_hora_consulta.isoformat(),
                "p_observacoes": dados.observacoes or "Agendamento via portal",
                "p_modalidade": dados.modalidade,
                "p_local_atendimento": "Campus Central" if dados.modalidade == "presencial" else "Plataforma Virtual",
                "p_tipo_servico": "individual",
            }
        ).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao agendar consulta")

        return AgendamentoResponse(
            message="Consulta agendada com sucesso",
            consulta_id=response.data
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))