from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_supabase_client
from app.schemas.triagem import TriagemRequest, TriagemResponse, TriagemAdminResponse
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.post("/triagem", response_model=TriagemResponse, dependencies=[Depends(security)])
async def criar_triagem(
    dados: TriagemRequest,
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
            cliente_novo = supabase_user.table("clientes").insert({
                "id_usuario": usuario_id,
                "status_tratamento": "triagem"
            }).execute()
            if not cliente_novo.data:
                raise HTTPException(status_code=500, detail="Erro ao criar perfil de cliente")
            cliente_id = cliente_novo.data[0]["id"]
        else:
            cliente_id = cliente_response.data[0]["id"]

        response = supabase_user.rpc(
            "sp_criar_triagem",
            {
                "p_id_cliente": cliente_id,
                "p_motivo": dados.motivo,
                "p_prioridade": dados.prioridade or "normal",
            }
        ).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="Erro ao criar triagem")

        return TriagemResponse(
            message="Triagem criada com sucesso",
            triagem_id=str(response.data)
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/admin/triagens", response_model=list[TriagemAdminResponse], dependencies=[Depends(security)])
async def listar_triagens_pendentes(
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

        triagens_response = supabase_user.table("triagens").select(
            "id, data_solicitacao, status, motivo, prioridade, id_cliente, "
            "clientes(id, usuarios(nome, email))"
        ).in_("status", ["pendente", "em_analise"]).order("data_solicitacao", desc=False).execute()

        if not triagens_response.data:
            return []

        triagens_formatadas = []
        for t in triagens_response.data:
            cliente = t.get("clientes", {}) or {}
            usuario_paciente = cliente.get("usuarios", {}) or {}

            triagens_formatadas.append({
                "id": t["id"],
                "data_solicitacao": t["data_solicitacao"],
                "status": t["status"],
                "motivo": t.get("motivo"),
                "prioridade": t.get("prioridade", "normal"),
                "paciente_nome": usuario_paciente.get("nome", "Paciente"),
                "paciente_email": usuario_paciente.get("email", ""),
                "paciente_id": cliente.get("id", ""),
            })

        return triagens_formatadas

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.get("/minha-triagem", dependencies=[Depends(security)])
async def buscar_minha_triagem(
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

        triagem_response = supabase_user.table("triagens").select(
            "id, motivo, prioridade, status, data_solicitacao"
        ).eq("id_cliente", cliente_id).order("data_solicitacao", desc=True).limit(1).execute()

        if not triagem_response.data:
            return {"motivo": None, "prioridade": None}

        triagem = triagem_response.data[0]

        return {
            "id": triagem["id"],
            "motivo": triagem["motivo"],
            "prioridade": triagem["prioridade"],
            "status": triagem["status"],
            "data_solicitacao": triagem["data_solicitacao"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))