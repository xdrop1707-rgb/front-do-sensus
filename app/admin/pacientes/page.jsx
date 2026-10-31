// app/admin/pacientes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ListaPacientes() {
  const supabase = createClient();

  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos"); // Novo estado para o filtro
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarPacientes() {
      const { data, error } = await supabase
        .from("vw_pacientes_ativos")
        .select("*");

      if (!error && data) {
        setPacientes(data);
      }
      setCarregando(false);
    }
    buscarPacientes();
  }, []);

  // Filtro que combina a Busca + o Status selecionado
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termoBusca = busca.toLowerCase();
    const nome = (paciente.nome || "").toLowerCase();
    const id = (paciente.id || "").toLowerCase();
    const email = (paciente.email || "").toLowerCase();

    const matchesBusca =
      nome.includes(termoBusca) ||
      id.includes(termoBusca) ||
      email.includes(termoBusca);

    const matchesStatus =
      filtroStatus === "todos"
        ? true
        : filtroStatus === "ativo"
          ? paciente.status_tratamento === "ativo"
          : paciente.status_tratamento !== "ativo";

    return matchesBusca && matchesStatus;
  });

  // Função para pegar as iniciais do nome (ex: "João Silva" -> "JS")
  const getIniciais = (nome) => {
    if (!nome) return "P";
    const partes = nome.trim().split(" ");
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
  };

  // Função para cortar o ID gigante
  const truncarId = (id) => {
    if (!id) return "";
    return `${id.substring(0, 8)}...`;
  };

  return (
    <div className="p-4 md:p-8 bg-[#E6F0F3] min-h-screen">
      {/* Cabeçalho */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E]">
            Registros de Pacientes
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Gerencie todos os pacientes da clínica.
          </p>
        </div>
        <Link
          href="/admin/novo-registro"
          className="bg-[#005C8A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#004a70] transition-colors shadow-md shadow-[#005C8A]/20 text-center"
        >
          + Novo Paciente
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-8">
        {/* Barra de Busca e Filtro */}
        <div className="mb-6 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por nome, ID ou e-mail..."
              className="w-full pl-10 pr-4 border border-gray-300 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none transition-all"
            />
          </div>

          {/* NOVO SELETOR DE FILTRO */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none cursor-pointer bg-white font-medium text-gray-600"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativos (Em Tratamento)</option>
            <option value="inativo">Inativos / Alta</option>
          </select>
        </div>

        {/* Contador de Resultados */}
        <div className="mb-4 text-sm text-gray-500">
          Mostrando{" "}
          <span className="font-bold text-gray-800">
            {pacientesFiltrados.length}
          </span>{" "}
          pacientes.
        </div>

        {carregando ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-4 font-medium">
              Buscando pacientes...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="pb-3 font-semibold px-2">Nome do Paciente</th>
                  <th className="pb-3 font-semibold px-2">ID</th>
                  <th className="pb-3 font-semibold px-2">E-mail</th>
                  <th className="pb-3 font-semibold px-2">Status</th>
                  <th className="pb-3 font-semibold px-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="border-b border-gray-100 hover:bg-[#F9FAFB] transition-colors group"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          {/* Avatar com Iniciais */}
                          <div className="w-10 h-10 rounded-full bg-[#E6F0F3] text-[#005C8A] flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {getIniciais(paciente.nome)}
                          </div>
                          <span className="font-medium text-gray-800">
                            {paciente.nome || "Sem nome"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-gray-500 text-sm font-mono">
                        {truncarId(paciente.id)}
                      </td>
                      <td className="py-4 px-2 text-gray-500 text-sm whitespace-nowrap">
                        {paciente.email || "Sem e-mail"}
                      </td>
                      <td className="py-4 px-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            paciente.status_tratamento === "ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {paciente.status_tratamento === "ativo"
                            ? "Em Tratamento"
                            : paciente.status_tratamento || "Inativo"}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-right">
                        <Link
                          href={`/admin/prontuario?id=${paciente.id}`}
                          className="text-[#005C8A] hover:text-[#00a3c4] text-sm font-semibold transition-colors whitespace-nowrap"
                        >
                          Abrir Prontuário →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      Nenhum paciente encontrado com o termo "{busca}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
