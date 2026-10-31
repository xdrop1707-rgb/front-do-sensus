// app/perfil/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PerfilPaciente() {
  const supabase = createClient();
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [usuario, setUsuario] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [curso, setCurso] = useState("");
  const [periodo, setPeriodo] = useState("");

  useEffect(() => {
    async function buscarDados() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // 👇 ADICIONE ESTA LINHA AQUI 👇
      console.log(
        "ID do usuário logado no Auth:",
        user?.id,
        "| Email:",
        user?.email,
      );
      // 👆 ----------------------- 👆

      if (!user) {
        setCarregando(false);
        return;
      }
      // ... resto do código

      // Busca os dados na tabela usuarios
      const { data: userPublico, error } = await supabase
        .from("usuarios")
        .select("id, nome, email, telefone, data_nascimento, foto_url")
        .eq("auth_user_id", user.id)
        .single();

      if (error || !userPublico) {
        console.log("Erro ao buscar usuário:", error);
        setCarregando(false);
        return;
      }

      setUsuario(userPublico);
      setNome(userPublico.nome || "");
      setTelefone(userPublico.telefone || "");
      setDataNascimento(userPublico.data_nascimento || "");
      setFotoUrl(userPublico.foto_url || "");

      const { data: cliente } = await supabase
        .from("clientes")
        .select("curso, periodo")
        .eq("id_usuario", userPublico.id)
        .single();

      if (cliente) {
        setCurso(cliente.curso || "");
        setPeriodo(cliente.periodo || "");
      }

      setCarregando(false);
    }
    buscarDados();
  }, [supabase]);

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !usuario) return;

    setEnviandoFoto(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${usuario.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatares").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ foto_url: publicUrl })
        .eq("id", usuario.id);

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

    // 👇 PROTEÇÃO: Se o usuário não carregou, não tenta salvar
    if (!usuario) {
      setMensagem(
        "Erro: Os dados do usuário ainda não foram carregados. Recarregue a página.",
      );
      return;
    }

    setSalvando(true);
    setMensagem("");

    const { error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ nome, telefone, data_nascimento: dataNascimento })
      .eq("id", usuario.id);

    if (erroUsuario) {
      setMensagem("Erro ao atualizar dados: " + erroUsuario.message);
      setSalvando(false);
      return;
    }

    const { error: erroCliente } = await supabase
      .from("clientes")
      .update({ curso, periodo })
      .eq("id_usuario", usuario.id);

    if (erroCliente) {
      setMensagem("Erro ao atualizar dados acadêmicos: " + erroCliente.message);
    } else {
      setMensagem("Perfil atualizado com sucesso!");
    }
    setSalvando(false);
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
          Gerencie suas informações pessoais e acadêmicas.
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
                {nome.charAt(0).toUpperCase() || "P"}
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
              {nome || "Nome do Paciente"}
            </h2>
            <p className="text-[#00a3c4] font-semibold mt-1">
              {usuario?.email}
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
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    E-mail (não editável)
                  </label>
                  <input
                    type="email"
                    value={usuario?.email || ""}
                    disabled
                    className="w-full border border-gray-200 bg-[#F9FAFB] text-gray-500 rounded-xl p-3 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Dados Acadêmicos */}
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
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                  />
                </svg>
                Dados Acadêmicos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Curso
                  </label>
                  <input
                    type="text"
                    value={curso}
                    onChange={(e) => setCurso(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Período
                  </label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
                  />
                </div>
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
