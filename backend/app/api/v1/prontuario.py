from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_supabase_client
from app.schemas.prontuario import (
    ProntuarioRequest, ProntuarioResponse,
    FeedbackRequest, FeedbackResponse
)
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.post("/admin/prontuario", response_model=ProntuarioResponse, dependencies=[Depends(security)])
async def salvar_prontuario(
    dados: ProntuarioRequest,
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

        usuario_response = supabase_user.table("usuarios").select("id, tipo").eq("auth_user_id", user_id).execute()
        if not usuario_response.data:
            raise HTTPException(status_code=404, detail="Perfil de usuário não encontrado")

        usuario = usuario_response.data[0]
        if usuario["tipo"] not in ["psicologo", "admin"]:
            raise HTTPException(status_code=403, detail="Acesso negado")

        psicologo_response = supabase_user.table("psicologos").select("id").eq("id_usuario", usuario["id"]).execute()
        if not psicologo_response.data:
            raise HTTPException(status_code=404, detail="Psicólogo não encontrado")

        psicologo_id = psicologo_response.data[0]["id"]

        response = supabase_user.rpc(
            "sp_realizar_consulta",
            {
                "p_consulta_id": dados.id_consulta,
                "p_prontuario": dados.prontuario,
                "p_status_clinico": dados.status_clinico,
                "p_humor_predominante": dados.humor_predominante,
                "p_revisao_medicacao": dados.revisao_medicacao,
                "p_intervencoes": dados.intervencoes,
                "p_plano_proximo": dados.plano_proximo,
                "p_id_psicologo": psicologo_id,
            }
        ).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao salvar prontuário")

        return ProntuarioResponse(
            message="Prontuário salvo com sucesso",
            prontuario_id=str(response.data)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/admin/feedback", response_model=FeedbackResponse, dependencies=[Depends(security)])
async def enviar_feedback(
    dados: FeedbackRequest,
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

        usuario_response = supabase_user.table("usuarios").select("id, tipo").eq("auth_user_id", user_id).execute()
        if not usuario_response.data:
            raise HTTPException(status_code=404, detail="Perfil de usuário não encontrado")

        usuario = usuario_response.data[0]
        if usuario["tipo"] not in ["psicologo", "admin"]:
            raise HTTPException(status_code=403, detail="Acesso negado")

        response = supabase_user.rpc(
            "sp_enviar_feedback",
            {
                "p_id_consulta": dados.id_consulta,
                "p_assunto": dados.assunto,
                "p_conteudo": dados.conteudo,
                "p_tipo": dados.tipo or "feedback",
            }
        ).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao enviar feedback")

        return FeedbackResponse(
            message="Feedback enviado com sucesso",
            comunicacao_id=str(response.data)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))