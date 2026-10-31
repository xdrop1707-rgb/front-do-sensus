"use server";

import { createClient } from "@/lib/supabase/server";

export async function agendarConsulta(formData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Você precisa estar logado para agendar." };
  }

  const { data: usuarioPublico } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!usuarioPublico) return { error: "Perfil não encontrado." };

  let { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("id_usuario", usuarioPublico.id)
    .single();

  if (!cliente) {
    const { data: novoCliente, error: erroNovo } = await supabase
      .from("clientes")
      .insert({ id_usuario: usuarioPublico.id, status_tratamento: "triagem" })
      .select("id")
      .single();

    if (erroNovo) return { error: erroNovo.message };
    cliente = novoCliente;
  }

  const idPsicologo = formData.get("psicologo");
  const data = formData.get("data");
  const horario = formData.get("horario");
  const modalidade = formData.get("modalidade");

  // 👇 NOVO: Pega o motivo da triagem que o front-end enviou
  const motivoTriagem =
    formData.get("motivo_triagem") || "Motivo não informado";

  const dataHora = `${data}T${horario}:00`;

  const { data: consultaId, error } = await supabase.rpc(
    "sp_agendar_consulta",
    {
      p_id_cliente: cliente.id,
      p_id_psicologo: idPsicologo,
      p_data_hora: dataHora,
      // 👇 NOVO: Salvando o motivo no campo de observações!
      p_observacoes: `Motivo da Triagem: ${motivoTriagem}`,
      p_modalidade: modalidade,
      p_local_atendimento:
        modalidade === "online" ? "Plataforma Virtual" : "Campus Central",
      p_tipo_servico: "individual",
    },
  );

  if (error) {
    if (
      error.message.includes("uk_psicologo_horario") ||
      error.code === "23505"
    ) {
      return {
        error: "Este horário já está ocupado. Por favor, escolha outro.",
      };
    }
    return { error: error.message };
  }

  return { success: true, consultaId };
}
