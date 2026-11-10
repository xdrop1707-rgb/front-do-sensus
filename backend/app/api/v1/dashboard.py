from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.security import HTTPBearer
from app.db.supabase_client import get_admin_client
from app.schemas.dashboard import DashboardResponse, ProximaConsulta
from datetime import datetime, timezone
from typing import Optional

router = APIRouter()
security = HTTPBearer()

@router.get("/admin/dashboard", response_model=DashboardResponse, dependencies=[Depends(security)])
async def obter_dashboard(
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

        vinculos_response = supabase_auth.table("vinculo_psicologo_paciente").select("id").eq("id_psicologo", psicologo_id).eq("status_vinculo", "ativo").execute()
        total_pacientes = len(vinculos_response.data) if vinculos_response.data else 0

        triagens_response = supabase_auth.table("triagens").select("id").eq("status", "pendente").execute()
        triagens_pendentes = len(triagens_response.data) if triagens_response.data else 0

        hoje = datetime.now(timezone.utc).date().isoformat()
        consultas_hoje_response = supabase_auth.table("consultas").select("id").eq("id_psicologo", psicologo_id).gte("data_hora_consulta", f"{hoje}T00:00:00").lte("data_hora_consulta", f"{hoje}T23:59:59").execute()
        sessoes_hoje = len(consultas_hoje_response.data) if consultas_hoje_response.data else 0

        agora = datetime.now(timezone.utc).isoformat()
        proximas_response = supabase_auth.table("consultas").select(
            "id, data_hora_consulta, clientes(usuarios(nome))"
        ).eq("id_psicologo", psicologo_id).gte("data_hora_consulta", agora).order("data_hora_consulta", desc=False).limit(3).execute()

        proximas_formatadas = []
        if proximas_response.data:
            for c in proximas_response.data:
                cliente = c.get("clientes", {}) or {}
                usuario_paciente = cliente.get("usuarios", {}) or {}
                data_hora = datetime.fromisoformat(c["data_hora_consulta"].replace("Z", "+00:00"))
                hora_formatada = data_hora.strftime("%H:%M")

                proximas_formatadas.append({
                    "id": c["id"],
                    "hora": hora_formatada,
                    "paciente": usuario_paciente.get("nome", "Paciente"),
                })

        return DashboardResponse(
            totalPacientes=total_pacientes,
            triagensPendentes=triagens_pendentes,
            sessoesHoje=sessoes_hoje,
            proximasConsultas=proximas_formatadas,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))