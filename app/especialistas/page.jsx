"use client";

import { useState } from "react";

const especialistas = [
  { 
    id: 1, 
    tipo: "Presencial",
    nome: "Atendimento Individual", 
    descricao: "Terapia focada no desenvolvimento pessoal e superação de desafios acadêmicos.",
    supervisor: "Dra. Elena Costa",
    estagiario: "Lucas M.",
    local: "Campus Central, Sala 304",
    info: "Requer Triagem Prévia",
    icone: "user"
  },
  { 
    id: 2, 
    tipo: "Online",
    nome: "Apoio Psicológico", 
    descricao: "Sessões remotas para orientação breve e acolhimento emocional.",
    supervisor: "Dr. Ricardo S.",
    estagiario: "Ana R.",
    local: "Plataforma Virtual Segura",
    info: "Pronto Atendimento",
    icone: "video"
  },
  { 
    id: 3, 
    tipo: "Presencial",
    nome: "Terapia em Grupo", 
    descricao: "Grupos de vivência sobre ansiedade acadêmica e transição de carreira.",
    supervisor: "Profa. Martins",
    local: "Anexo Sul, Sala de Práticas A",
    info: "Requer Inscrição no Edital",
    icone: "group"
  },
];

export default function Especialistas() {
  const [filtro, setFiltro] = useState("Todos");

  const filtrados = filtro === "Todos"
    ? especialistas
    : especialistas.filter((e) => e.tipo === filtro);

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-bold text-[#004E6E]">Horários Disponíveis</h1>
        <span className="bg-gray-100 text-gray-500 text-[11px] px-3 py-1.5 rounded-full font-bold tracking-wide">
          Mostrando {filtrados.length} resultados
        </span>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-10">
        {["Todos", "Presencial", "Online"].map((opcao) => (
          <button
            key={opcao}
            onClick={() => setFiltro(opcao)}
            className={`px-5 py-2 rounded-full text-xs font-bold border transition-colors ${
              filtro === opcao
                ? "bg-[#004E6E] text-white border-[#004E6E]"
                : "bg-white text-gray-600 border-gray-300 hover:border-[#004E6E] hover:text-[#004E6E]"
            }`}
          >
            {opcao}
          </button>
        ))}
      </div>

      {/* Grid de Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {filtrados.map((e) => (
          <div key={e.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            
            {/* Tag e Ícone do topo */}
            <div className="flex justify-between items-start mb-5">
              <span className={`text-[11px] px-2.5 py-1 rounded-md font-bold ${
                e.tipo === "Online" 
                  ? "bg-[#E0F2FE] text-[#0284C7]" 
                  : "bg-[#FEF3C7] text-[#B45309]"
              }`}>
                {e.tipo}
              </span>
              <div className="text-[#004E6E] opacity-80">
                {e.icone === "user" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                {e.icone === "video" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>}
                {e.icone === "group" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
              </div>
            </div>

            {/* Título e Descrição */}
            <h2 className="text-[17px] font-bold text-gray-800 mb-2">{e.nome}</h2>
            <p className="text-gray-500 text-sm mb-6 flex-grow leading-snug">{e.descricao}</p>

            {/* Informações Detalhadas */}
            <div className="space-y-2.5 text-xs text-gray-500 mb-8">
              <p className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span>Supervisão: {e.supervisor}</span>
              </p>
              {e.estagiario && (
                <p className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <span>Estagiário: {e.estagiario}</span>
                </p>
              )}
              <p className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                <span>{e.local}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>{e.info}</span>
              </p>
            </div>

            {/* Botão */}
            <button className="w-full border border-gray-300 text-gray-700 rounded-full py-2.5 text-sm font-semibold hover:bg-[#004E6E] hover:text-white hover:border-[#004E6E] transition-colors">
              Selecionar Horário
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}