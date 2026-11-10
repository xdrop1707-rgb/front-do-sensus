"use server";

import { createClient } from "@/lib/supabase/server";

export async function salvarProntuario(dados) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Você precisa estar logado." };
  }

  try {
    // 🛠️ SANITIZAÇÃO DOS DADOS (A correção do Erro 500)
    // Garante que nenhum campo crítico vá vazio ou undefined para o Python
    const dadosSeguros = {
      ...dados,
      id_consulta: dados.id_consulta || dados.id,
      humor_predominante: dados.humor_predominante || "Positivo",
      intervencoes: dados.intervencoes || "Nenhuma",
      status_clinico: dados.status_clinico || "Estável",
      revisao_medicacao: dados.revisao_medicacao ?? false,
      plano_proximo: dados.plano_proximo || "Continuar acompanhamento",
      // O campo prontuario (texto) nunca pode ir vazio
      prontuario: dados.prontuario || "Sem anotações registradas nesta sessão.",
    };

    const response = await fetch(
      `${process.env.API_URL}/api/v1/admin/prontuario`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dadosSeguros), // Envia os dados limpos
      },
    );

    const dataResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Sessão expirada. Faça login novamente." };
      }
      if (response.status === 403) {
        return { error: "Você não tem permissão para salvar este prontuário." };
      }
      if (response.status === 404) {
        return { error: "Consulta não encontrada." };
      }
      if (response.status === 500) {
        // Se ainda der 500, mostra o detalhe do erro do Python para ajudar no debug
        console.error("Erro do backend:", dataResponse);
        return {
          error:
            dataResponse.detail ||
            "Erro interno do servidor. Verifique os dados.",
        };
      }
      return { error: dataResponse.detail || "Erro ao salvar prontuário." };
    }

    return { success: true, prontuarioId: dataResponse.prontuario_id };
  } catch (error) {
    return { error: "Erro de conexão com o servidor: " + error.message };
  }
}

export async function enviarFeedback(dados) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: "Você precisa estar logado." };
  }

  try {
    // Sanitização do Feedback
    const dadosSeguros = {
      ...dados,
      id_consulta: dados.id_consulta || dados.id,
      assunto: dados.assunto || "Orientação da Sessão",
      conteudo: dados.conteudo || "Sem conteúdo.",
      tipo: dados.tipo || "feedback",
    };

    const response = await fetch(
      `${process.env.API_URL}/api/v1/admin/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(dadosSeguros),
      },
    );

    const dataResponse = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { error: "Sessão expirada. Faça login novamente." };
      }
      if (response.status === 403) {
        return {
          error: "Você não tem permissão para enviar feedback desta consulta.",
        };
      }
      if (response.status === 404) {
        return { error: "Consulta não encontrada." };
      }
      if (response.status === 500) {
        console.error("Erro do backend:", dataResponse);
        return {
          error:
            dataResponse.detail ||
            "Erro interno do servidor. Verifique os dados.",
        };
      }
      return { error: dataResponse.detail || "Erro ao enviar feedback." };
    }

    return { success: true, comunicacaoId: dataResponse.comunicacao_id };
  } catch (error) {
    return { error: "Erro de conexão com o servidor: " + error.message };
  }
}
