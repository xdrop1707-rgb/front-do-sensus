"use server";

import { createClient } from "@/lib/supabase/server";

export async function buscarPacientesDoPsicologo() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Você precisa estar logado." };
  }

  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/admin/pacientes`, {
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
        return { error: "Acesso negado. Apenas psicólogos podem acessar esta lista." };
      }
      if (response.status === 500) {
        return { error: "Erro interno do servidor. Tente novamente mais tarde." };
      }
      return { error: data.detail || "Erro ao buscar pacientes." };
    }

    return { success: true, pacientes: data };
  } catch (error) {
    return { error: "Erro de conexão com o servidor: " + error.message };
  }
}