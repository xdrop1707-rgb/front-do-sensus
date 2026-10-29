// app/admin/pacientes/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ListaPacientes() {
  const supabase = createClient();

  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Busca os pacientes quando a tela carrega
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

  // Filtra os pacientes com base no texto digitado
  const pacientesFiltrados = pacientes.filter((paciente) => {
    const termoBusca = busca.toLowerCase();
    const nome = (paciente.nome || "").toLowerCase();
    const id = (paciente.id || "").toLowerCase();
    const email = (paciente.email || "").toLowerCase(); // <-- ADICIONADO AQUI
    return (
      nome.includes(termoBusca) ||
      id.includes(termoBusca) ||
      email.includes(termoBusca)
    );
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Registros de Pacientes
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie todos os pacientes da clínica.
          </p>
        </div>
        <Link
          href="/admin/novo-registro"
          className="bg-[#005C8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#004a70]"
        >
          + Novo Paciente
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Barra de Busca Funcional */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar pacientes por nome ou ID..."
            className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
          />
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
            Filtrar
          </button>
        </div>

        {carregando ? (
          <p className="text-gray-500 text-center py-8">
            Carregando pacientes...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Nome do Paciente</th>
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">E-mail</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.length > 0 ? (
                  pacientesFiltrados.map((paciente) => (
                    <tr
                      key={paciente.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 font-medium text-gray-800">
                        {paciente.nome || "Sem nome"}
                      </td>
                      <td className="py-4 text-gray-500 text-sm">
                        {paciente.id}
                      </td>
                      <td className="py-4 text-gray-500 text-sm">
                        {paciente.email || "Sem e-mail"}
                      </td>
                      <td className="py-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {paciente.status_tratamento === "ativo"
                            ? "Em Tratamento"
                            : paciente.status_tratamento}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link
                          href={`/admin/prontuario?id=${paciente.id}`}
                          className="text-[#005C8A] hover:underline text-sm font-medium"
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
