// app/admin/novo-registro/page.jsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      const idUsuario = crypto.randomUUID();
      const idCliente = crypto.randomUUID();

      const { error: erroUsuario } = await supabase.from("usuarios").insert({
        id: idUsuario,
        nome,
        email,
        telefone,
        data_nascimento: dataNascimento,
        tipo: "cliente",
      });
      if (erroUsuario) throw new Error("Erro usuário: " + erroUsuario.message);

      const { error: erroCliente } = await supabase.from("clientes").insert({
        id: idCliente,
        id_usuario: idUsuario,
        status_tratamento: "ativo",
      });
      if (erroCliente) throw new Error("Erro cliente: " + erroCliente.message);

      const { error: erroVinculo } = await supabase
        .from("vinculo_psicologo_paciente")
        .insert({
          id_psicologo: "33333333-3333-3333-3333-333333333333",
          id_cliente: idCliente,
          data_inicio_vinculo: new Date().toISOString().split("T")[0],
        });
      if (erroVinculo) throw new Error("Erro vínculo: " + erroVinculo.message);

      alert("Paciente cadastrado com sucesso!");
      router.push("/admin");
    } catch (error) {
      alert(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* COLUNA ESQUERDA: Formulário */}
      <div className="w-full lg:w-3/5 flex justify-center items-center p-4 md:p-8 bg-[#E6F0F3]">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#E6F0F3] p-3 rounded-xl text-[#005C8A]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#005C8A]">
                Novo Registro de Paciente
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Preencha os dados para cadastrar um novo paciente.
              </p>
            </div>
          </div>

          <form onSubmit={handleSalvar} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] focus:border-[#005C8A] outline-none"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] focus:border-[#005C8A] outline-none"
                  placeholder="joao@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Telefone
                </label>
                <input
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] focus:border-[#005C8A] outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Data de Nascimento
              </label>
              <input
                type="date"
                required
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] focus:border-[#005C8A] outline-none text-gray-600"
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row gap-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.push("/admin")}
                className="md:w-1/3 px-4 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={carregando}
                className="md:w-2/3 flex justify-center items-center gap-2 px-4 py-3 bg-[#005C8A] text-white rounded-xl text-sm font-semibold hover:bg-[#004a70] disabled:opacity-50 transition-all shadow-lg shadow-[#005C8A]/30"
              >
                {carregando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  "Salvar Paciente"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 👇 COLUNA DIREITA: DESIGN MINIMALISTA 👇 */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#004E6E] relative overflow-hidden items-center justify-center">
        {/* Imagem de fundo com overlay escuro para efeito de profundidade */}
        <Image
          src="/clinica.jpg"
          alt="Fundo Sensus"
          fill
          className="object-cover opacity-20 mix-blend-luminosity"
        />

        {/* Cartão de Citação (Glassmorphism) */}
        <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl max-w-sm mx-auto shadow-2xl">
          {/* Ícone de Aspas Grandes */}
          <svg
            className="w-12 h-12 text-[#00a3c4] mb-6 opacity-80"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>

          <h2 className="text-2xl font-medium text-white leading-snug mb-6">
            "A maior jornada de um ser humano é a descoberta de si mesmo."
          </h2>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a3c4]/30 flex items-center justify-center border border-[#00a3c4]/50">
              <svg
                className="w-5 h-5 text-[#00a3c4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                Sistema Seguro e Criptografado
              </p>
              <p className="text-blue-200 text-xs">Sensus Clínica</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
