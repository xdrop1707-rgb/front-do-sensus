"use server";

import { createClient } from "@/lib/supabase/server";

export async function cancelarConsulta(idConsulta) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Você precisa estar logado." };
  }

  const { error } = await supabase
    .from("consultas")
    .update({ status: "cancelada" })
    .eq("id", idConsulta);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}