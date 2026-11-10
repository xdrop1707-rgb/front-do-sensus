"use server";

import { createClient } from "@/lib/supabase/server";

export async function criarTriagem(formData) {
  const supabase = await createClient();
  const motivo = formData.get("motivo");

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Você precisa estar logado para solicitar uma triagem." };
  }

  const { data: usuarioPublico, error: userError } = await supabase
    .from("usuarios")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (userError || !usuarioPublico) {
    return { error: "Perfil de usuário não encontrado." };
  }

  let { data: cliente, error: clienteError } = await supabase
    .from("clientes")
    .select("id")
    .eq("id_usuario", usuarioPublico.id)
    .single();

  if (clienteError) {
    const { data: novoCliente, error: novoClienteError } = await supabase
      .from("clientes")
      .insert({ id_usuario: usuarioPublico.id, status_tratamento: "triagem" })
      .select("id")
      .single();

    if (novoClienteError) return { error: novoClienteError.message };
    cliente = novoCliente;
  }

  const { error } = await supabase.from("triagens").insert({
    id_cliente: cliente.id,
    motivo: motivo,
    prioridade: "normal",
    status: "pendente",
    id_psicologo: "33333333-3333-3333-3333-333333333333",
    data_triagem: new Date().toISOString(),
  });

  if (error) {
    return { error: "Erro ao salvar no banco: " + error.message };
  }

  return { success: true };
}
