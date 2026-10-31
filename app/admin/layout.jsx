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
  const [menuAberto, setMenuAberto] = useState(false);

  const isActive = (path) => pathname === path;

  const handleLogout = async () => {
    setSaindo(true);
    await supabase.auth.signOut();
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] relative">
      {menuAberto && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* SIDEBAR AZUL ESCURO */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-[#004E6E] flex flex-col p-4 transition-transform duration-300 ease-in-out
          ${menuAberto ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0
        `}
      >
        <div className="flex items-center gap-3 mb-8 px-2 mt-2">
          <div className="bg-white/10 text-white p-2.5 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-tight">
              Admin Clínico
            </h1>
            <p className="text-blue-200 text-sm">Saúde Universitária</p>
          </div>
        </div>

        <Link href="/admin/novo-registro" onClick={() => setMenuAberto(false)}>
          <button className="w-full bg-[#00a3c4] hover:bg-[#0090ad] text-white font-medium py-3 px-4 rounded-xl mb-6 flex items-center justify-center gap-2 transition-colors text-base shadow-lg shadow-[#00a3c4]/30">
            <span className="text-xl leading-none">+</span> Novo Registro
          </button>
        </Link>

        <nav className="flex flex-col gap-2">
          <Link
            href="/admin"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Painel
          </Link>

          <Link
            href="/admin/pacientes"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/pacientes") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            Registros de Pacientes
          </Link>

          <Link
            href="/admin/agenda"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/agenda") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Agenda
          </Link>

          <Link
            href="/admin/feedback"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/feedback") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Central de Feedback
          </Link>

          <Link
            href="/admin/prontuario"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/prontuario") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Registros Clínicos
          </Link>

          <Link
            href="/admin/configuracoes"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/configuracoes") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Perfil
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
          {/* 👇 LINK ATUALIZADO AQUI 👇 */}
          <Link
            href="/admin/ajuda"
            onClick={() => setMenuAberto(false)}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${isActive("/admin/ajuda") ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"}`}
          >
            <svg
              className="w-5 h-5"
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
            Central de Ajuda
          </Link>

          <button
            onClick={handleLogout}
            disabled={saindo}
            className={`p-3 rounded-xl flex items-center gap-3 text-sm font-medium w-full text-left transition-all duration-200 ${saindo ? "bg-white/5 text-blue-300 cursor-not-allowed" : "text-blue-100 hover:bg-red-500/20 hover:text-red-300"}`}
          >
            {saindo ? (
              <>
                <span className="animate-spin text-lg">⏳</span> Saindo...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Sair
              </>
            )}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto w-full flex flex-col min-w-0 bg-[#E6F0F3]">
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-[#004E6E] text-white p-1.5 rounded-lg">
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
            <span className="font-bold text-[#004E6E]">Admin</span>
          </div>
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </header>

        <div className="flex-1">
          <Suspense
            fallback={
              <div className="p-8 text-[#004E6E]">Carregando painel...</div>
            }
          >
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
