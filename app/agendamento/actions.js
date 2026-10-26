"use server";

import { createClient } from "@/lib/supabase/server";

export async function agendarConsulta(formData) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Você precisa estar logado para agendar." };
  }

  const { data: usuarioPublico } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!usuarioPublico) return { error: "Perfil não encontrado." };

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id")
    .eq("id_usuario", usuarioPublico.id)
    .single();

  if (!cliente) return { error: "Você precisa solicitar uma triagem antes de agendar." };

  const idPsicologo = formData.get("psicologo");
  const data = formData.get("data");
  const horario = formData.get("horario");
  const modalidade = formData.get("modalidade");
  

  const dataHora = `${data}T${horario}:00`;

  const { data: consultaId, error } = await supabase.rpc("sp_agendar_consulta", {
    p_id_cliente: cliente.id,
    p_id_psicologo: idPsicologo,
    p_data_hora: dataHora,
    p_observacoes: "Agendamento via portal do paciente",
    p_modalidade: modalidade,
    p_local_atendimento: modalidade === "online" ? "Plataforma Virtual" : "Campus Central",
    p_tipo_servico: "individual",
  });

  if (error) {
    if (error.message.includes("uk_psicologo_horario") || error.code === "23505") {
      return { error: "Este horário já está ocupado. Por favor, escolha outro." };
    }
    return { error: error.message };
  }

  return { success: true, consultaId };
}