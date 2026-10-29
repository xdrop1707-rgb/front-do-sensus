// app/admin/feedback/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CentralFeedback() {
  const supabase = createClient();

  const [comunicacoes, setComunicacoes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarComunicacoes() {
      // 1. Pega o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !user.email) {
        setCarregando(false);
        return;
      }

      // 2. Busca o psicólogo PELO E-MAIL (mais confiável que o ID)
      const { data: usuario } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", user.email)
        .single();

      if (!usuario) {
        setCarregando(false);
        return;
      }

      const { data: psicologo } = await supabase
        .from("psicologos")
        .select("id")
        .eq("id_usuario", usuario.id)
        .single();

      if (!psicologo) {
        setCarregando(false);
        return;
      }

      // 3. Busca as comunicações desse psicólogo
      const { data, error } = await supabase
        .from("comunicacoes")
        .select("*")
        .eq("id_psicologo", psicologo.id)
        .order("data_envio", { ascending: false });

      if (!error && data) {
        setComunicacoes(data);
      }
      setCarregando(false);
    }

    buscarComunicacoes();
  }, []);

  // FUNÇÃO PARA EXCLUIR O FEEDBACK
  const handleExcluir = async (id) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir este feedback? Essa ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("comunicacoes")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        setComunicacoes((prev) => prev.filter((com) => com.id !== id));
      }
    } catch (err) {
      alert("Erro inesperado: " + err.message);
    }
  };

  const comunicacoesFiltradas = comunicacoes.filter((com) => {
    const termoBusca = busca.toLowerCase();
    const assunto = (com.assunto || "").toLowerCase();
    const conteudo = (com.conteudo || "").toLowerCase();
    return assunto.includes(termoBusca) || conteudo.includes(termoBusca);
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Central de Feedback
        </h1>
        <p className="text-gray-500 mt-1">
          Histórico de todas as comunicações que você enviou.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por assunto ou conteúdo..."
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
          />
        </div>

        {carregando ? (
          <p className="text-gray-500 text-center py-8">
            Carregando feedbacks...
          </p>
        ) : (
          <div className="space-y-4">
            {comunicacoesFiltradas.length > 0 ? (
              comunicacoesFiltradas.map((com) => (
                <div
                  key={com.id}
                  className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{com.assunto}</h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-full font-bold uppercase">
                        {com.status || "ENVIADO"}
                      </span>
                      <button
                        onClick={() => handleExcluir(com.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                        title="Excluir feedback"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{com.conteudo}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>
                      Data:{" "}
                      {com.data_envio
                        ? new Date(com.data_envio).toLocaleDateString("pt-BR")
                        : "Indisponível"}
                    </span>
                    <span>Tipo: {com.tipo || "feedback"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum feedback encontrado para você.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
