"use client";

import { useState, useEffect } from "react";
import { buscarPacientesDoPsicologo } from "./actions";
import Link from "next/link";

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    async function carregarPacientes() {
      const resultado = await buscarPacientesDoPsicologo();
      if (resultado.error) {
        setMensagem(resultado.error);
      } else {
        setPacientes(resultado.pacientes || []);
      }
      setCarregando(false);
    }
    carregarPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter((p) => {
    const termo = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(termo) ||
      p.id.toLowerCase().includes(termo) ||
      p.email.toLowerCase().includes(termo)
    );
  });

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registros de Pacientes</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os pacientes da clínica.</p>
        </div>
        <Link href="/admin/novo-registro" className="bg-[#005C8A] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#004a70]">
          + Novo Paciente
        </Link>
      </div>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">{mensagem}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar pacientes por nome ou ID..."
            className="flex-1 border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#005C8A] outline-none"
          />
        </div>

        {carregando ? (
          <p className="text-gray-500 text-center py-8">Carregando pacientes...</p>
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
                    <tr key={paciente.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 font-medium text-gray-800">{paciente.nome}</td>
                      <td className="py-4 text-gray-500 text-sm">{paciente.id}</td>
                      <td className="py-4 text-gray-500 text-sm">{paciente.email}</td>
                      <td className="py-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          {paciente.status_tratamento === "ativo" ? "Em Tratamento" : paciente.status_tratamento}
                        </span>
                      </td>
                      <td className="py-4">
                        <Link href={`/admin/prontuario?id=${paciente.id}`} className="text-[#005C8A] hover:underline text-sm font-medium">
                          Abrir Prontuário →
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">Nenhum paciente encontrado.</td>
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