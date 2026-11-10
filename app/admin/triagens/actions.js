"use server";

import { createClient } from "@/lib/supabase/server";

export async function buscarTriagensPendentes() {
  const supabase = await createClient();

  const { data: triagens, error } = await supabase
    .from("triagens")
    .select("*")
    .order("data_solicitacao", { ascending: false });

  if (error) return { error: "Erro no banco: " + error.message };
  if (!triagens || triagens.length === 0)
    return { success: true, triagens: [] };

  const triagensFormatadas = [];

  for (const t of triagens) {
    let pacienteNome = "Paciente";
    let pacienteEmail = "Sem e-mail";

    if (t.id_cliente) {
      const { data: cliente } = await supabase
        .from("clientes")
        .select("id_usuario")
        .eq("id", t.id_cliente)
        .maybeSingle();

      if (cliente && cliente.id_usuario) {
        const { data: usuario } = await supabase
          .from("usuarios")
          .select("nome, email")
          .eq("id", cliente.id_usuario)
          .maybeSingle();

        if (usuario) {
          pacienteNome = usuario.nome;
          pacienteEmail = usuario.email;
        }
      }
    }

    triagensFormatadas.push({
      id: t.id,
      motivo: t.motivo,
      prioridade: t.prioridade,
      data_solicitacao: t.data_solicitacao,
      paciente_id: t.id_cliente,
      paciente_nome: pacienteNome,
      paciente_email: pacienteEmail,
    });
  }

  return { success: true, triagens: triagensFormatadas };
}
