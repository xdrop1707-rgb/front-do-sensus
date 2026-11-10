"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NovoRegistro() {
  const supabase = createClient();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSalvar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar logado como psicólogo.");

      const { data: usuarioLogado } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", user.id)
        .single();

      if (!usuarioLogado) throw new Error("Perfil do psicólogo não encontrado.");

      const { data: psicologo } = await supabase
        .from("psicologos")
        .select("id")
        .eq("id_usuario", usuarioLogado.id)
        .single();

      if (!psicologo) throw new Error("Psicólogo não encontrado.");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            telefone,
            data_nascimento: dataNascimento,
            tipo: "cliente",
          },
        },
      });

      if (authError) throw new Error("Erro ao criar usuário: " + authError.message);
      if (!authData.user) throw new Error("Usuário não foi criado.");

      const { data: usuarioPublico } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", authData.user.id)
        .single();

      if (!usuarioPublico) throw new Error("Perfil do paciente não foi criado.");

      const { data: cliente, error: erroCliente } = await supabase
        .from("clientes")
        .insert({ id_usuario: usuarioPublico.id, status_tratamento: "ativo" })
        .select("id")
        .single();

      if (erroCliente) throw new Error("Erro ao criar cliente: " + erroCliente.message);

      const { error: erroVinculo } = await supabase
        .from("vinculo_psicologo_paciente")
        .insert({
          id_psicologo: psicologo.id,
          id_cliente: cliente.id,
          data_inicio_vinculo: new Date().toISOString().split("T")[0],
          status_vinculo: "ativo",
        });

      if (erroVinculo) throw new Error("Erro ao criar vínculo: " + erroVinculo.message);

      setMensagem("Paciente cadastrado com sucesso!");
      setTimeout(() => router.push("/admin/pacientes"), 1500);
    } catch (error) {
      setMensagem(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Registro de Paciente</h1>
        <p className="text-gray-500 mb-8 text-sm">Preencha os dados abaixo para cadastrar um novo paciente.</p>

        {mensagem && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${mensagem.includes("sucesso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="Ex: João da Silva" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="joao@email.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha (para o paciente logar)</label>
              <input type="password" required minLength={6} value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="Mínimo 6 caracteres" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="text" required value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" placeholder="(11) 99999-9999" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input type="date" required value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 text-sm" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => router.push("/admin")} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={carregando} className="flex-1 px-4 py-2.5 bg-[#005C8A] text-white rounded-lg text-sm font-medium hover:bg-[#004a70] disabled:opacity-50">
              {carregando ? "Salvando..." : "Salvar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}