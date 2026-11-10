"use server";

import { createClient } from "@/lib/supabase/server";

export async function buscarMinhasConsultas() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Você precisa estar logado." };

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!usuario) return { error: "Perfil não encontrado." };

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("id_usuario", usuario.id)
    .single();

  if (!cliente) return { error: "Cliente não encontrado." };

  // 👇 REMOVIDO O status_pagamento E valor_total DAQUI 👇
  const { data: consultas, error } = await supabase
    .from("consultas")
    .select(
      `
      id,
      data_hora_consulta,
      status,
      modalidade,
      observacoes,
      psicologos!consultas_id_psicologo_fkey (
        especialidade,
        usuarios!psicologos_id_usuario_fkey (nome)
      )
    `,
    )
    .eq("id_cliente", cliente.id)
    .neq("status", "cancelada")
    .order("data_hora_consulta", { ascending: false });

  if (error) return { error: "Erro ao buscar: " + error.message };

  const consultasFormatadas = consultas.map((c) => ({
    id: c.id,
    data_hora_consulta: c.data_hora_consulta,
    status: c.status,
    modalidade: c.modalidade,
    observacoes: c.observacoes,
    psicologo_nome: c.psicologos?.usuarios?.nome || "Psicólogo",
    psicologo_especialidade: c.psicologos?.especialidade || "Especialidade",
  }));

  return { success: true, consultas: consultasFormatadas };
}

export async function cancelarConsulta(idConsulta) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("consultas")
    .update({ status: "cancelada" })
    .eq("id", idConsulta);

  if (error) return { error: "Erro ao cancelar: " + error.message };

  return { success: true };
}
