// app/triagem/page.jsx
"use client";

import { useState } from "react";
import { criarTriagem } from "./actions";
import Link from "next/link";

export default function Triagem() {
  const [motivo, setMotivo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const [resultadoIA, setResultadoIA] = useState(null);

  const enviar = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    try {
      const URL_API = "https://api-clinica-ml.onrender.com/classificar";

      const respostaIA = await fetch(URL_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo: motivo }),
      });

      const dadosIA = await respostaIA.json();

      console.log("Resultado da IA:", dadosIA);
      setResultadoIA(dadosIA);

      localStorage.setItem("motivo_triagem", motivo);

      const formData = new FormData();
      formData.append("motivo", motivo);

      const resultado = await criarTriagem(formData);

      if (resultado.error) {
        setMensagem(`Erro: ${resultado.error}`);
      } else {
        setEnviado(true);
      }
    } catch (erro) {
      console.error(erro);
      setMensagem(
        "Erro ao conectar com o serviço de triagem. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-16 text-center">
        <div className="bg-white border border-sensus-border rounded-2xl p-6 md:p-12">
          <h1 className="text-2xl md:text-3xl font-bold text-sensus-primary mb-4">
            Obrigado!
          </h1>
          <p className="text-sensus-muted mb-8 text-sm md:text-base">
            Sua solicitação de triagem foi recebida com sucesso. Nossa equipe
            entrará em contato em breve.
          </p>

          {resultadoIA && (
            <div
              className={`p-4 mb-8 rounded-lg font-semibold text-sm md:text-base ${
                resultadoIA.nivel === "alta"
                  ? "bg-red-100 text-red-700"
                  : resultadoIA.nivel === "media"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              Prioridade detectada: {resultadoIA.cor}{" "}
              {resultadoIA.nivel.toUpperCase()}
            </div>
          )}

          <Link
            href="/especialistas"
            className="inline-block bg-sensus-primary text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-colors"
          >
            Ver Especialistas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-16">
      <h1 className="text-2xl md:text-3xl font-bold text-sensus-primary mb-2">
        Solicitar Triagem
      </h1>
      <p className="text-sensus-muted mb-8 text-sm md:text-base">
        Conte-nos brevemente o que está sentindo. Suas informações são
        confidenciais.
      </p>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">
          {mensagem}
        </div>
      )}

      <form
        onSubmit={enviar}
        className="bg-white border border-sensus-border rounded-2xl p-5 md:p-8 space-y-4 shadow-sm"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">
            Motivo da Consulta
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={6}
            placeholder="Descreva brevemente o que te traz aqui hoje..."
            className="w-full border border-sensus-border rounded-lg px-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-sensus-primary outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={carregando}
          className="w-full flex justify-center items-center gap-2 bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {/* 👇 LOADING SPINNER NO BOTÃO 👇 */}
          {carregando ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analisando...
            </>
          ) : (
            "Enviar Solicitação"
          )}
        </button>
      </form>
    </div>
  );
}
