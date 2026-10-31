"use server";

import { createClient } from "@/lib/supabase/server";

export async function deletarConsultaNoBanco(id_consulta) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("consultas")
    .delete()
    .eq("id", id_consulta);
  if (error) return { error: error.message };
  return { success: true };
}
