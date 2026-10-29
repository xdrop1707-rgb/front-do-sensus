// app/admin/configuracoes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

  // FUNÇÃO PARA UPLOAD DA FOTO
  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnviandoFoto(true);
    try {
      // Cria um nome único para o arquivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${psicologoId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Faz o upload para o bucket 'avatares'
      const { error: uploadError } = await supabase.storage
        .from("avatares")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pega a URL pública da imagem
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatares").getPublicUrl(filePath);

      // Atualiza a coluna foto_url no banco
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
    return <div className="p-8 text-gray-500">Carregando perfil...</div>;
  }

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">
          Gerencie suas informações pessoais e profissionais.
        </p>
      </div>

      {/* CARD FLUTUANTE DO PERFIL */}
      <div className="max-w-2xl mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-6">
        <div className="relative">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt="Foto de Perfil"
              className="w-24 h-24 rounded-full object-cover border-4 border-[#005C8A]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold border-4 border-[#005C8A]">
              {nome.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Botão de Upload */}
          <label className="absolute bottom-0 right-0 bg-[#005C8A] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#004a70] transition-colors">
            <span className="text-xs">📷</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadFoto}
              className="hidden"
              disabled={enviandoFoto}
            />
          </label>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {nome || "Nome do Psicólogo"}
          </h2>
          <p className="text-[#005C8A] font-medium">
            {especialidade || "Especialidade"}
          </p>
          <p className="text-sm text-gray-500">{crp || "CRP não informado"}</p>
          {enviandoFoto && (
            <p className="text-xs text-blue-500 mt-1">Enviando foto...</p>
          )}
        </div>
      </div>

      <div className="max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {mensagem && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm ${
              mensagem.includes("sucesso")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {mensagem}
          </div>
        )}

        <form onSubmit={handleSalvar} className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Dados Pessoais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail (não editável)
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-2.5 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Dados Profissionais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CRP
                </label>
                <input
                  type="text"
                  value={crp}
                  onChange={(e) => setCrp(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abordagem Terapêutica
              </label>
              <input
                type="text"
                value={abordagem}
                onChange={(e) => setAbordagem(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da Consulta (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorConsulta}
                  onChange={(e) => setValorConsulta(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campus
                </label>
                <input
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sala
                </label>
                <input
                  type="text"
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  id="disponivel"
                  checked={disponivel}
                  onChange={(e) => setDisponivel(e.target.checked)}
                  className="w-4 h-4 text-[#005C8A] rounded focus:ring-[#005C8A]"
                />
                <label
                  htmlFor="disponivel"
                  className="text-sm font-medium text-gray-700"
                >
                  Disponível para novos agendamentos
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-[#005C8A] text-white py-3 rounded-lg font-medium hover:bg-[#004a70] disabled:opacity-50 transition-colors"
            >
              {salvando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
