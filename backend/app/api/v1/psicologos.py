from fastapi import APIRouter, Depends, HTTPException
from app.db.supabase_client import get_admin_client
from app.schemas.psicologo import PsicologoResponse
from supabase import Client
from typing import List

router = APIRouter()

@router.get("/psicologos", response_model=List[PsicologoResponse])
async def listar_psicologos(supabase: Client = Depends(get_admin_client)):
    try:
        response = supabase.table("psicologos").select(
            "id, id_usuario, especialidade, valor_consulta, campus, sala, foto_url"
        ).eq("disponivel", True).execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Nenhum psicólogo encontrado")

        psicologos_formatados = []

        for p in response.data:
            nome = "Psicólogo"
            if p.get("id_usuario"):
                user_response = supabase.table("usuarios").select("nome").eq("id", p["id_usuario"]).execute()
                if user_response.data:
                    nome = user_response.data[0].get("nome", "Psicólogo")

            psicologos_formatados.append({
                "id": p["id"],
                "nome": nome,
                "especialidade": p["especialidade"],
                "valor_consulta": float(p["valor_consulta"]),
                "campus": p.get("campus"),
                "sala": p.get("sala"),
                "foto_url": p.get("foto_url"),
            })

        return psicologos_formatados

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))