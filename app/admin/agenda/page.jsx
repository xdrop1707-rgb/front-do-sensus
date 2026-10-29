// app/admin/agenda/page.jsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Agenda() {
  const supabase = createClient();

  const [consultas, setConsultas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarConsultas() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !user.email) {
        setCarregando(false);
        return;
      }

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

      // Busca as consultas
      const { data: consultasData, error } = await supabase
        .from("consultas")
        .select("*")
        .eq("id_psicologo", psicologo.id)
        .order("data_hora_consulta", { ascending: true });

      if (error || !consultasData) {
        setCarregando(false);
        return;
      }

      // Para cada consulta, busca o nome do paciente
      const consultasComNomes = [];
      for (const consulta of consultasData) {
        let nomePaciente = "Paciente não identificado";

        // Busca o id_usuario na tabela clientes
        const { data: cliente, error: erroCliente } = await supabase
          .from("clientes")
          .select("id_usuario")
          .eq("id", consulta.id_cliente)
          .maybeSingle();

        console.log(
          "Consulta ID:",
          consulta.id,
          "| Cliente:",
          cliente,
          "| Erro:",
          erroCliente,
        );

        if (cliente && cliente.id_usuario) {
          const { data: usuarioPaciente, error: erroUsuario } = await supabase
            .from("usuarios")
            .select("nome")
            .eq("id", cliente.id_usuario)
            .maybeSingle();

          console.log(
            "Usuário Paciente:",
            usuarioPaciente,
            "| Erro:",
            erroUsuario,
          );

          if (usuarioPaciente && usuarioPaciente.nome) {
            nomePaciente = usuarioPaciente.nome;
          }
        }

        consultasComNomes.push({ ...consulta, nome_paciente: nomePaciente });
      }

      setConsultas(consultasComNomes);
      setCarregando(false);
    }
    buscarConsultas();
  }, []);

  const consultasPorDia = consultas.reduce((acc, consulta) => {
    const dataObj = new Date(consulta.data_hora_consulta);
    const dia = dataObj.toLocaleDateString("pt-BR");
    if (!acc[dia]) acc[dia] = [];
    acc[dia].push(consulta);
    return acc;
  }, {});

  return (
    <div className="p-8 bg-[#F9FAFB] min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Minha Agenda</h1>
        <p className="text-gray-500 mt-1">
          Acompanhe suas consultas e compromissos.
        </p>
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando agenda...</p>
      ) : consultas.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-500">
          Nenhuma consulta agendada no momento.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(consultasPorDia).map(([dia, consultasDoDia]) => (
            <div key={dia}>
              <h2 className="text-lg font-bold text-[#005C8A] mb-3 border-b border-gray-200 pb-2">
                {dia}
              </h2>
              <div className="space-y-3">
                {consultasDoDia.map((consulta) => {
                  const hora = new Date(
                    consulta.data_hora_consulta,
                  ).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={consulta.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 text-[#005C8A] font-bold p-3 rounded-lg text-sm w-20 text-center">
                          {hora}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {consulta.nome_paciente}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {consulta.tipo_agendamento || "Consulta"} •{" "}
                            {consulta.modalidade || "Presencial"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          consulta.status === "realizada"
                            ? "bg-green-100 text-green-700"
                            : consulta.status === "agendada"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {consulta.status || "Agendada"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
