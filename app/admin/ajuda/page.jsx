// app/admin/ajuda/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function CentralAjuda() {
  const [faqAberto, setFaqAberto] = useState(null);

  const toggleFaq = (index) => {
    setFaqAberto(faqAberto === index ? null : index);
  };

  const perguntasFrequentes = [
    {
      pergunta: "Como funciona a Inteligência Artificial na Agenda?",
      resposta:
        "O sistema lê o texto preenchido pelo paciente na Triagem e classifica a urgência em Baixa (Verde), Média (Amarelo) ou Alta (Vermelho). Isso ajuda você a priorizar os atendimentos mais críticos no dia a dia.",
    },
    {
      pergunta: "O que acontece quando eu 'Nego' uma consulta?",
      resposta:
        "Ao clicar em 'Negar', a consulta é apagada do seu painel e o horário fica livre para outros pacientes. Certifique-se de que é isso que deseja antes de confirmar, pois a ação não pode ser desfeita.",
    },
    {
      pergunta: "Como faço para salvar o prontuário do paciente?",
      resposta:
        "Na tela de Prontuário Clínico, escreva as observações no editor de texto. Você precisa ter uma consulta agendada para aquele paciente. Depois, clique em 'Salvar com Segurança'. A IA pode gerar um resumo do texto para facilitar.",
    },
    {
      pergunta: "Como atualizo meus dados profissionais?",
      resposta:
        "Basta ir na aba 'Perfil' no menu lateral. Lá você pode alterar sua especialidade, abordagem, valor da consulta, foto de perfil e a sua disponibilidade para novos agendamentos.",
    },
    {
      pergunta: "Os dados dos pacientes estão seguros?",
      resposta:
        "Sim. O sistema utiliza autenticação segura do Supabase, criptografia HTTPS e regras de acesso no banco de dados (RLS). Apenas você tem acesso aos prontuários dos seus pacientes.",
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004E6E]">
            Central de Ajuda
          </h1>
          <p className="text-gray-600 mt-2 text-base">
            Encontre respostas rápidas ou entre em contato com o suporte
            técnico.
          </p>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Esquerda: FAQ (Ocupa 7 colunas) */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 h-full">
            <h2 className="text-xl font-bold text-[#004E6E] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <svg
                className="w-6 h-6 text-[#00a3c4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Perguntas Frequentes
            </h2>

            <div className="space-y-3">
              {perguntasFrequentes.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-xl overflow-hidden transition-all bg-[#F9FAFB]"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-800 text-sm md:text-base pr-4">
                      {item.pergunta}
                    </span>
                    <div className="bg-white p-1 rounded-full shadow-sm">
                      <svg
                        className={`w-4 h-4 text-[#004E6E] transition-transform duration-200 ${faqAberto === index ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {faqAberto === index && (
                    <div className="p-4 bg-white border-t border-gray-100">
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.resposta}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Coluna Direita: Suporte e Guia (Ocupa 5 colunas) */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            {/* Card Suporte */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 text-center flex-1 flex flex-col justify-center">
              <div className="bg-[#E6F0F3] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-[#004E6E]">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#004E6E] mb-2">
                Suporte Técnico
              </h3>
              <p className="text-sm text-gray-500 mb-6 max-w-[250px] mx-auto">
                Problemas com o sistema, IA ou banco de dados? Fale com a
                equipe.
              </p>

              <a
                href="mailto:suporte@sensus.edu.br"
                className="inline-block w-full bg-[#005C8A] text-white py-3 rounded-xl font-semibold hover:bg-[#004a70] transition-colors shadow-md mt-auto"
              >
                Enviar E-mail
              </a>
            </div>

            {/* Card Guia Rápido */}
            <div className="bg-[#004E6E] rounded-3xl shadow-sm p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>

              <h3 className="text-lg font-bold text-white mb-2 relative z-10">
                Guia Rápido
              </h3>
              <p className="text-sm text-blue-100 mb-6 relative z-10">
                Precisa de ajuda com a Inteligência Artificial ou agendamentos?
                Veja o manual completo.
              </p>
              <Link
                href="#"
                className="inline-block w-full text-center bg-[#00a3c4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-opacity-90 transition-colors relative z-10 mt-auto"
              >
                Baixar Manual (PDF)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
