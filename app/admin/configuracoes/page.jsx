// app/admin/configuracoes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function Configuracoes() {
  const supabase = createClient();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [usuarioId, setUsuarioId] = useState(null);
  const [psicologoId, setPsicologoId] = useState(null);

  // Dados do usuário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  // Dados do psicólogo
  const [crp, setCrp] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [abordagem, setAbordagem] = useState("");
  const [valorConsulta, setValorConsulta] = useState("");
  const [campus, setCampus] = useState("");
  const [sala, setSala] = useState("");
  const [disponivel, setDisponivel] = useState(true);
  const [fotoUrl, setFotoUrl] = useState("");

  useEffect(() => {
    async function buscarDados() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setCarregando(false);
        return;
      }

      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id, nome, email")
        .eq("email", user.email)
        .single();
      if (!usuario) {
        setCarregando(false);
        return;
      }

      setUsuarioId(usuario.id);
      setNome(usuario.nome || "");
      setEmail(usuario.email || "");

      const { data: psicologo } = await supabase
        .from("psicologos")
        .select("*")
        .eq("id_usuario", usuario.id)
        .single();

      if (psicologo) {
        setPsicologoId(psicologo.id);
        setCrp(psicologo.crp || "");
        setEspecialidade(psicologo.especialidade || "");
        setAbordagem(psicologo.abordagem_terapeutica || "");
        setValorConsulta(psicologo.valor_consulta || "");
        setCampus(psicologo.campus || "");
        setSala(psicologo.sala || "");
        setDisponivel(psicologo.disponivel ?? true);
        setFotoUrl(psicologo.foto_url || "");
      }
      setCarregando(false);
    }
    buscarDados();
  }, []);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnviandoFoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${psicologoId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatares").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("psicologos")
        .update({ foto_url: publicUrl })
        .eq("id", psicologoId);
      if (updateError) throw updateError;

      setFotoUrl(publicUrl);
      setMensagem("Foto atualizada com sucesso!");
    } catch (error) {
      setMensagem("Erro ao enviar foto: " + error.message);
    } finally {
      setEnviandoFoto(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    setSalvando(true);
    setMensagem("");

    try {
      const { error: erroUsuario } = await supabase
        .from("usuarios")
        .update({ nome })
        .eq("id", usuarioId);
      if (erroUsuario)
        throw new Error("Erro ao atualizar nome: " + erroUsuario.message);

      const { error: erroPsicologo } = await supabase
        .from("psicologos")
        .update({
          crp,
          especialidade,
          abordagem_terapeutica: abordagem,
          valor_consulta: parseFloat(valorConsulta) || 0,
          campus,
          sala,
          disponivel,
        })
        .eq("id", psicologoId);

      if (erroPsicologo)
        throw new Error("Erro ao atualizar perfil: " + erroPsicologo.message);

      setMensagem("Perfil atualizado com sucesso!");
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#E6F0F3]">
        <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#004E6E] mt-4 font-semibold">
          Carregando perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
          Meu Perfil
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          Gerencie suas informações pessoais e profissionais.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* CARD DO PERFIL */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative flex-shrink-0">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt="Foto de Perfil"
                className="w-28 h-28 rounded-full object-cover border-4 border-[#E6F0F3] shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#E6F0F3] flex items-center justify-center text-[#005C8A] text-3xl font-bold border-4 border-white shadow-md">
                {nome.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-[#005C8A] text-white p-2 rounded-full cursor-pointer hover:bg-[#004a70] transition-colors shadow-lg border-2 border-white">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadFoto}
                className="hidden"
                disabled={enviandoFoto}
              />
            </label>
          </div>

          <div className="text-center md:text-left mt-2 md:mt-0">
            <h2 className="text-2xl font-bold text-[#004E6E]">
              {nome || "Nome do Psicólogo"}
            </h2>
            <p className="text-[#00a3c4] font-semibold mt-1">
              {especialidade || "Especialidade"}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center justify-center md:justify-start gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6"
                />
              </svg>
              {crp || "CRP não informado"}
            </p>
            {enviandoFoto && (
              <p className="text-xs text-[#00a3c4] mt-2 animate-pulse">
                Enviando foto...
              </p>
            )}
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
          {mensagem && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm font-medium ${mensagem.includes("sucesso") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}
            >
              {mensagem}
            </div>
          )}

          <form onSubmit={handleSalvar} className="space-y-8">
            {/* Dados Pessoais */}
            <div>
              <h2 className="text-lg font-bold text-[#004E6E] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] focus:border-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    E-mail (não editável)
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full border border-gray-200 bg-[#F9FAFB] text-gray-500 rounded-xl p-3 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div>
              <h2 className="text-lg font-bold text-[#004E6E] mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Dados Profissionais
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    CRP
                  </label>
                  <input
                    type="text"
                    value={crp}
                    onChange={(e) => setCrp(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Abordagem Terapêutica
                </label>
                <input
                  type="text"
                  value={abordagem}
                  onChange={(e) => setAbordagem(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Valor da Consulta (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorConsulta}
                    onChange={(e) => setValorConsulta(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Campus
                  </label>
                  <input
                    type="text"
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 items-end">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={sala}
                    onChange={(e) => setSala(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>

                {/* Checkbox de Disponibilidade customizado */}
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={disponivel}
                    onChange={(e) => setDisponivel(e.target.checked)}
                    className="w-5 h-5 text-[#005C8A] rounded focus:ring-[#005C8A] border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Disponível para novos agendamentos
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={salvando}
                className="w-full flex justify-center items-center gap-2 bg-[#005C8A] text-white py-3.5 rounded-xl font-semibold hover:bg-[#004a70] disabled:opacity-50 transition-all shadow-md shadow-[#005C8A]/30"
              >
                {salvando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
