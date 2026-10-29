"use server";

import { createClient } from "@/lib/supabase/server";

export async function criarTriagem(formData) {
  const supabase = await createClient(); 
  const motivo = formData.get("motivo");

  const { data: { user }, error: authError } = await supabase.auth.getUser();

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

  const { error } = await supabase.rpc("sp_criar_triagem", {
    p_id_cliente: cliente.id,
    p_motivo: motivo,
    p_prioridade: "normal",
  });

  if (error) return { error: error.message };

  return { success: true };
}