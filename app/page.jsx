"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const [user, setUser] = useState(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, [supabase]);

  return (
    <div className="w-full">
      {/* 👇 SEÇÃO HERO ESTILO "BANNER PREMIUM" 👇 */}
      <section className="w-full bg-[#E6F0F3] pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Cartão Branco Central */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            {/* Lado Esquerdo: Texto */}
            <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#004E6E] mb-6 leading-[1.2]">
                Seu bem-estar mental
                <br className="hidden lg:block" /> em primeiro lugar.
              </h1>
              <p className="text-gray-600 text-sm md:text-base mb-8 leading-relaxed">
                A Clínica Universitária oferece suporte psicológico acessível,
                unindo excelência acadêmica e cuidado humanizado. Encontre o
                espaço seguro que você precisa para crescer.
              </p>

              {/* Botão de Ação (CTA) */}
              <div>
                <Link
                  href="/especialistas"
                  className="inline-block bg-[#00a3c4] text-white px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors shadow-md"
                >
                  Conhecer Especialistas
                </Link>
              </div>
            </div>

            {/* Lado Direito: Imagem */}
            <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[500px]">
              <Image
                src="/clinica.jpg"
                alt="Clínica Universitária"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ÁREA DO PACIENTE (Só aparece se estiver logado) */}
      {user && (
        <section className="max-w-6xl mx-auto px-4 md:px-8 -mt-8 relative z-10 mb-16">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-[#004E6E] mb-2">
              Área do Paciente
            </h2>
            <p className="text-gray-500 mb-6 text-sm md:text-base">
              Acesse rapidamente suas informações e agendamentos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/perfil"
                className="bg-gray-50 hover:bg-[#E6F0F3] p-5 rounded-xl border border-gray-100 transition-colors"
              >
                <h3 className="font-bold text-[#004E6E] mb-1">Meu Perfil</h3>
                <p className="text-sm text-gray-500">
                  Atualize seus dados pessoais e acadêmicos.
                </p>
              </Link>
              <Link
                href="/triagem"
                className="bg-gray-50 hover:bg-[#E6F0F3] p-5 rounded-xl border border-gray-100 transition-colors"
              >
                <h3 className="font-bold text-[#004E6E] mb-1">Fazer Triagem</h3>
                <p className="text-sm text-gray-500">
                  Conte-nos o que está sentindo para direcionarmos o
                  atendimento.
                </p>
              </Link>
              <Link
                href="/agendamento"
                className="bg-gray-50 hover:bg-[#E6F0F3] p-5 rounded-xl border border-gray-100 transition-colors"
              >
                <h3 className="font-bold text-[#004E6E] mb-1">
                  Agendar Consulta
                </h3>
                <p className="text-sm text-gray-500">
                  Escolha o profissional, a data e o horário.
                </p>
              </Link>
              <Link
                href="/minhas-consultas"
                className="bg-gray-50 hover:bg-[#E6F0F3] p-5 rounded-xl border border-gray-100 transition-colors"
              >
                <h3 className="font-bold text-[#004E6E] mb-1">
                  Minhas Consultas
                </h3>
                <p className="text-sm text-gray-500">
                  Veja o histórico e os feedbacks recebidos.
                </p>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* SEÇÃO DE DESAFIOS (Colado nas bordas) */}
      <section className="w-full bg-[#F3EDE9]">
        <div className="max-w-7xl mx-auto py-12 md:py-20 px-4">
          <h2 className="text-2xl md:text-4xl font-semibold text-center text-gray-900 mb-10">
            Possivelmente você enfrenta alguns desses desafios
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row w-full">
          <div className="bg-[#8C918E] w-full lg:w-1/4 py-12 px-8 text-white flex flex-col items-center">
            <h3 className="text-3xl font-bold mb-1">1.</h3>
            <h4 className="text-2xl font-bold text-center mb-6">
              Ansiedade Intensa
            </h4>
            <ul className="list-disc pl-5 space-y-3 text-[15px]">
              <li>Tem crises de ansiedade</li>
              <li>Tem pensamentos acelerados e falta de foco.</li>
              <li>Fica muito nervoso(a) em situações específicas.</li>
              <li>Sente cansaço físico e mental, mesmo nas folgas.</li>
              <li>Dorme mal e acorda esgotado (a).</li>
            </ul>
          </div>

          <div className="bg-[#FDF4F7] w-full lg:w-1/4 py-12 px-8 text-gray-900 flex flex-col items-center">
            <h3 className="text-3xl font-bold mb-1">2.</h3>
            <h4 className="text-2xl font-bold text-center mb-6">
              Baixa Autoestima
              <br />
              Inseguranças
            </h4>
            <ul className="list-disc pl-5 space-y-3 text-[15px]">
              <li>Evita se expor por medo de críticas.</li>
              <li>Vive se comparando com os outros.</li>
              <li>Tem dificuldade para reconhecer o próprio valor.</li>
              <li>Acredita que os outros são mais capazes.</li>
              <li>Perde oportunidades por insegurança.</li>
            </ul>
          </div>

          <div className="bg-[#F0F9FA] w-full lg:w-1/4 py-12 px-8 text-gray-900 flex flex-col items-center">
            <h3 className="text-3xl font-bold mb-1">3.</h3>
            <h4 className="text-2xl font-bold text-center mb-6">
              Desafios nos
              <br />
              Relacionamentos
            </h4>
            <ul className="list-disc pl-5 space-y-3 text-[15px]">
              <li>Ciúmes, insegurança ou dependência emocional.</li>
              <li>
                Está cogitando ou tentando superar um término de relacionamento.
              </li>
              <li>Dificuldade para colocar limites.</li>
              <li>Conflitos frequentes e falhas na comunicação.</li>
              <li>Medo de rejeição ou abandono.</li>
            </ul>
          </div>

          <div className="bg-[#B5E9F9] w-full lg:w-1/4 py-12 px-8 text-gray-900 flex flex-col items-center">
            <h3 className="text-3xl font-bold mb-1">4.</h3>
            <h4 className="text-2xl font-bold text-center mb-6">
              Autossabotagem
            </h4>
            <ul className="list-disc pl-5 space-y-3 text-[15px]">
              <li>Começa, mas desiste no meio do caminho.</li>
              <li>Adia decisões importantes e procrastina.</li>
              <li>O medo de errar faz você não tentar.</li>
              <li>Repete padrões que continuam causando sofrimento.</li>
              <li>Sente que nunca consegue alcançar o que deseja.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
