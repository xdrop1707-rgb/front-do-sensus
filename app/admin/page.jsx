// app/admin/page.jsx
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

// Componente que busca os dados (async, roda no servidor)
async function DashboardContent() {
  await connection(); // Avisa o Next.js que essa parte é dinâmica

  const supabase = await createClient();

  const { data: metricas } = await supabase
    .from("vw_dashboard_admin")
    .select("*")
    .single();

  const { data: pacientes, error: erroPacientes } = await supabase
    .from("vw_pacientes_ativos")
    .select("*");

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
        <p className="text-gray-500 mt-1">
          Gerencie sua lista clínica, veja históricos e atualize status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Pacientes Ativos
          </p>
          <h2 className="text-4xl font-bold text-[#005C8A]">
            {metricas?.pacientes_ativos || 0}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Triagens Pendentes
          </p>
          <h2 className="text-4xl font-bold text-[#8B7E53]">
            {metricas?.triagens_pendentes || 0}
          </h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Sessões Hoje</p>
          <h2 className="text-4xl font-bold text-[#005C8A]">
            {metricas?.sessoes_hoje || 0}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Lista de Pacientes
        </h2>

        {erroPacientes ? (
          <p className="text-red-500">
            Erro ao carregar pacientes: {erroPacientes.message}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="pb-3 font-medium">Nome do Paciente</th>
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pacientes && pacientes.length > 0 ? (
                  pacientes.map((paciente) => (
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
                      <td className="py-4">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Em Tratamento
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
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      Nenhum paciente encontrado na view.
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

// A página em si (componente normal, síncrono)
export default function PainelAdmin() {
  return (
    <Suspense
      fallback={<div className="p-8 text-gray-500">Carregando painel...</div>}
    >
      <DashboardContent />
    </Suspense>
  );
}
