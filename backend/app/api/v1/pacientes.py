from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_admin_client
from app.schemas.paciente import PacienteResponse
from typing import List, Optional

router = APIRouter()
security = HTTPBearer()

@router.get("/admin/pacientes", response_model=List[PacienteResponse], dependencies=[Depends(security)])
async def listar_pacientes_do_psicologo(
    authorization: Optional[str] = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token de autenticação não fornecido")

    try:
        token = authorization.replace("Bearer ", "")
        supabase_auth = get_admin_client()

        user_response = supabase_auth.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Usuário não autenticado")

        user_id = user_response.user.id

        usuario_response = supabase_auth.table("usuarios").select("id, tipo").eq("auth_user_id", user_id).execute()
        if not usuario_response.data:
            raise HTTPException(status_code=404, detail="Perfil de usuário não encontrado")

        usuario = usuario_response.data[0]
        if usuario["tipo"] not in ["psicologo", "admin"]:
            raise HTTPException(status_code=403, detail="Acesso negado")

        psicologo_response = supabase_auth.table("psicologos").select("id").eq("id_usuario", usuario["id"]).execute()
        if not psicologo_response.data:
            raise HTTPException(status_code=404, detail="Psicólogo não encontrado")

        psicologo_id = psicologo_response.data[0]["id"]

        vinculos_response = supabase_auth.table("vinculo_psicologo_paciente").select(
            "id_cliente, "
            "clientes(id, status_tratamento, usuarios(nome, email))"
        ).eq("id_psicologo", psicologo_id).eq("status_vinculo", "ativo").execute()

        if not vinculos_response.data:
            return []

        pacientes_formatados = []
        for v in vinculos_response.data:
            cliente = v.get("clientes", {}) or {}
            paciente_usuario = cliente.get("usuarios", {}) or {}

            pacientes_formatados.append({
                "id": cliente.get("id", ""),
                "nome": paciente_usuario.get("nome", "Sem nome"),
                "email": paciente_usuario.get("email", "Sem e-mail"),
                "status_tratamento": cliente.get("status_tratamento", "ativo"),
            })

        return pacientes_formatados

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))