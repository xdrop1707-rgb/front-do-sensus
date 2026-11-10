from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_supabase_client
from app.schemas.consulta import ConsultaResponse
from typing import List, Optional

router = APIRouter()
security = HTTPBearer()

@router.get("/minhas-consultas", response_model=List[ConsultaResponse], dependencies=[Depends(security)])
async def listar_minhas_consultas(
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

        consultas_response = supabase_user.table("consultas").select(
            "id, data_hora_consulta, status, modalidade, observacoes, "
            "psicologos(id_usuario, especialidade), "
            "pagamentos(valor_total, status_pagamento)"
        ).eq("id_cliente", cliente_id).order("data_hora_consulta", desc=True).execute()

        if not consultas_response.data:
            return []

        consultas_formatadas = []
        for c in consultas_response.data:
            psicologo_nome = "Psicólogo"
            if c.get("psicologos") and c["psicologos"].get("id_usuario"):
                user_psi = supabase_user.table("usuarios").select("nome").eq("id", c["psicologos"]["id_usuario"]).execute()
                if user_psi.data:
                    psicologo_nome = user_psi.data[0].get("nome", "Psicólogo")

            pagamento = c.get("pagamentos") or {}

            consultas_formatadas.append({
                "id": c["id"],
                "data_hora_consulta": c["data_hora_consulta"],
                "status": c["status"],
                "modalidade": c["modalidade"],
                "observacoes": c.get("observacoes"),
                "psicologo_nome": psicologo_nome,
                "psicologo_especialidade": c["psicologos"]["especialidade"] if c.get("psicologos") else "Não informada",
                "valor_total": float(pagamento["valor_total"]) if pagamento.get("valor_total") else None,
                "status_pagamento": pagamento.get("status_pagamento"),
            })

        return consultas_formatadas

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cancelar-consulta/{consulta_id}", dependencies=[Depends(security)])
async def cancelar_consulta(
    consulta_id: str,
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

        consulta_response = supabase_user.table("consultas").select("id_cliente, status").eq("id", consulta_id).execute()
        if not consulta_response.data:
            raise HTTPException(status_code=404, detail="Consulta não encontrada")

        consulta = consulta_response.data[0]
        if consulta["id_cliente"] != cliente_id:
            raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta consulta")

        if consulta["status"] not in ["agendada", "confirmada"]:
            raise HTTPException(status_code=400, detail="Esta consulta não pode ser cancelada")

        supabase_user.table("consultas").update({"status": "cancelada"}).eq("id", consulta_id).execute()

        return {"message": "Consulta cancelada com sucesso", "consulta_id": consulta_id}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))