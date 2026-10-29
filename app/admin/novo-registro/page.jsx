// app/admin/novo-registro/page.jsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function NovoRegistro() {
  const supabase = createClient();
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      // Gera um ID único para o novo paciente
      const idUsuario = crypto.randomUUID();
      const idCliente = crypto.randomUUID();

      // 1. Cria o usuário na tabela 'usuarios'
      const { error: erroUsuario } = await supabase.from("usuarios").insert({
        id: idUsuario,
        nome: nome,
        email: email,
        telefone: telefone,
        data_nascimento: dataNascimento,
        tipo: "cliente", // O tipo que descobrimos que o banco aceita
      });

      if (erroUsuario)
        throw new Error("Erro ao criar usuário: " + erroUsuario.message);

      // 2. Cria o perfil clínico na tabela 'clientes'
      const { error: erroCliente } = await supabase.from("clientes").insert({
        id: idCliente,
        id_usuario: idUsuario,
        status_tratamento: "ativo",
      });

      if (erroCliente)
        throw new Error("Erro ao criar cliente: " + erroCliente.message);

      // 3. Cria o vínculo com o psicólogo logado
      // (Usando o ID fixo do psicólogo que a gente criou nos testes)
      const { error: erroVinculo } = await supabase
        .from("vinculo_psicologo_paciente")
        .insert({
          id_psicologo: "33333333-3333-3333-3333-333333333333",
          id_cliente: idCliente,
          data_inicio_vinculo: new Date().toISOString().split("T")[0],
        });

      if (erroVinculo)
        throw new Error("Erro ao criar vínculo: " + erroVinculo.message);

      alert("Paciente cadastrado com sucesso!");
      router.push("/admin"); // Redireciona de volta para o Dashboard
    } catch (error) {
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Novo Registro de Paciente
        </h1>
        <p className="text-gray-500 mb-8 text-sm">
          Preencha os dados abaixo para cadastrar um novo paciente no sistema.
        </p>

        <form onSubmit={handleSalvar} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                placeholder="joao@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone
              </label>
              <input
                type="text"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento
            </label>
            <input
              type="date"
              required
              value={dataNascimento}
              onChange={(e) => setDataNascimento(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 px-4 py-2.5 bg-[#005C8A] text-white rounded-lg text-sm font-medium hover:bg-[#004a70] disabled:opacity-50"
            >
              {carregando ? "Salvando..." : "Salvar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
