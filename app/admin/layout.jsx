// app/admin/layout.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, Suspense } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const supabase = createClient();
  const [saindo, setSaindo] = useState(false);

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    setSaindo(true);
    await supabase.auth.signOut();

    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="bg-[#005C8A] text-white p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-[#005C8A] font-bold text-xl leading-tight">
              Admin Clínico
            </h1>
            <p className="text-sm text-gray-500">Saúde Universitária</p>
          </div>
        </div>

        <Link href="/admin/novo-registro">
          <button className="w-full bg-[#005C8A] hover:bg-[#004a70] text-white font-medium py-2.5 px-4 rounded-full mb-6 flex items-center justify-center gap-2 transition-colors text-base">
            <span>+</span> Novo Registro
          </button>
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/admin"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>🔲</span> Painel
          </Link>

          <Link
            href="/admin/pacientes"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin/pacientes")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>👤</span> Registros de Pacientes
          </Link>

          {/* LINK DA AGENDA ATUALIZADO */}
          <Link
            href="/admin/agenda"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin/agenda")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>📅</span> Agenda
          </Link>

          <Link
            href="/admin/feedback"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin/feedback")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>✉️</span> Central de Feedback
          </Link>

          <Link
            href="/admin/prontuario"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin/prontuario")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>📄</span> Registros Clínicos
          </Link>

          <Link
            href="/admin/configuracoes"
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium ${
              isActive("/admin/configuracoes")
                ? "bg-[#005C8A] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span>👤</span> Perfil
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-200 flex flex-col gap-1">
          <Link
            href="#"
            className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-3 text-base font-medium"
          >
            <span>❓</span> Central de Ajuda
          </Link>

          <button
            onClick={handleLogout}
            disabled={saindo}
            className={`p-2.5 rounded-lg flex items-center gap-3 text-base font-medium w-full text-left transition-all duration-200 ${
              saindo
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {saindo ? (
              <>
                <span className="animate-spin text-lg">⏳</span> Saindo...
              </>
            ) : (
              <>
                <span>🚪</span> Sair
              </>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Suspense
          fallback={
            <div className="p-8 text-gray-500">Carregando painel...</div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
}
