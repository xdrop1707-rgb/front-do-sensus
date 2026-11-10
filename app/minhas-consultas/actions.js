"use server";

import { createClient } from "@/lib/supabase/server";

export async function cancelarConsulta(idConsulta) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Você precisa estar logado." };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/cancelar-consulta/${idConsulta}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
      },
    });

    const dataResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Sessão expirada. Faça login novamente." };
      }
      if (response.status === 403) {
        return { error: "Você não tem permissão para cancelar esta consulta." };
      }
      if (response.status === 404) {
        return { error: "Consulta não encontrada." };
      }
      if (response.status === 400) {
        return { error: dataResponse.detail || "Esta consulta não pode ser cancelada." };
      }
      return { error: dataResponse.detail || "Erro ao cancelar consulta." };
    }

    return { success: true };
  } catch (error) {
    return { error: "Erro de conexão com o servidor: " + error.message };
  }
}export async function buscarMinhasConsultas() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Você precisa estar logado." };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/minhas-consultas`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Sessão expirada. Faça login novamente." };
      }
      if (response.status === 403) {
        return { error: "Acesso negado." };
      }
      if (response.status === 404) {
        return { error: "Perfil de usuário não encontrado." };
      }
      if (response.status === 500) {
        return { error: "Erro interno do servidor. Tente novamente mais tarde." };
      }
      return { error: data.detail || "Erro ao buscar consultas." };
    }

    return { success: true, consultas: data };
  } catch (error) {
    return { error: "Erro de conexão com o servidor: " + error.message };
  }
}