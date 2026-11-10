"use server";

import { createClient } from "@/lib/supabase/server";

export async function criarTriagem(formData) {
  const supabase = await createClient();
  const motivo = formData.get("motivo");
  const prioridadeIA = formData.get("prioridade") || "normal";

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Você precisa estar logado." };
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

  const { error } = await supabase.from("triagens").insert({
    id_cliente: cliente.id,
    motivo: motivo,
    prioridade: prioridadeIA,
    status: "pendente",
    id_psicologo: "33333333-3333-3333-3333-333333333333",
    data_triagem: new Date().toISOString(),
  });

  if (error) return { error: "Erro no banco: " + error.message };

  return { success: true };
}
