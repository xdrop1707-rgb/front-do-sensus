// app/layout.jsx
"use client";

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/cadastro";
  const [user, setUser] = useState(null);
  const [supabase] = useState(() => createClient());

  const [menuAberto, setMenuAberto] = useState(false);

  // 👇 NOVO: Estado para controlar o "Saindo..."
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    setMenuAberto(false);
  }, [pathname]);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setSaindo(true); // 👈 Ativa o estado "Saindo..."
    await supabase.auth.signOut();
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <html lang="pt-BR">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sensus" />
        <meta name="theme-color" content="#004E6E" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#F9FAFB]">
        {!isAdmin && !isAuthPage && (
          <>
            <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 relative z-50">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/logo.png"
                    alt="Sensus Logo"
                    width={160}
                    height={40}
                    className="object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </Link>

                {/* MENU DESKTOP */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
                  <Link href="/especialistas" className="hover:text-[#004E6E]">
                    Agendamentos
                  </Link>
                  <Link href="/servicos" className="hover:text-[#004E6E]">
                    Serviços
                  </Link>
                  <Link href="/clinica" className="hover:text-[#004E6E]">
                    Nossa Clínica
                  </Link>
                  <Link href="/recursos" className="hover:text-[#004E6E]">
                    Recursos
                  </Link>

                  <div className="w-px h-6 bg-gray-300 mx-2"></div>

                  {user ? (
                    <>
                      <Link
                        href="/minhas-consultas"
                        className="text-[#004E6E] hover:opacity-80"
                      >
                        Minhas Consultas
                      </Link>
                      <Link
                        href="/triagem"
                        className="text-[#004E6E] hover:opacity-80"
                      >
                        Triagem
                      </Link>
                      <Link
                        href="/perfil"
                        className="text-[#004E6E] font-semibold hover:opacity-80"
                      >
                        Meu Perfil
                      </Link>

                      {/* 👇 BOTÃO SAIR COM EFEITO 👇 */}
                      <button
                        onClick={handleLogout}
                        disabled={saindo}
                        className={`flex items-center gap-1 transition-colors ${saindo ? "text-gray-400 cursor-not-allowed" : "text-red-500 hover:text-red-700 font-semibold"}`}
                      >
                        {saindo ? (
                          <>
                            <span className="animate-spin text-sm">⏳</span>{" "}
                            Saindo...
                          </>
                        ) : (
                          "Sair"
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="text-[#004E6E] hover:opacity-80"
                      >
                        Login
                      </Link>
                      <Link
                        href="/cadastro"
                        className="bg-[#004E6E] text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition"
                      >
                        Cadastre-se
                      </Link>
                    </>
                  )}
                </nav>

                {/* BOTÃO HAMBÚRGUER */}
                <button
                  className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setMenuAberto(!menuAberto)}
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
              </div>

              {/* MENU MOBILE */}
              {menuAberto && (
                <nav className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg flex flex-col p-4 space-y-2 text-sm font-medium text-gray-600">
                  <Link
                    href="/especialistas"
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    Agendamentos
                  </Link>
                  <Link
                    href="/servicos"
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    Serviços
                  </Link>
                  <Link
                    href="/clinica"
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    Nossa Clínica
                  </Link>
                  <Link
                    href="/recursos"
                    className="p-2 hover:bg-gray-50 rounded-lg"
                  >
                    Recursos
                  </Link>

                  <div className="h-px bg-gray-200 my-2"></div>

                  {user ? (
                    <>
                      <Link
                        href="/minhas-consultas"
                        className="p-2 text-[#004E6E] font-semibold hover:bg-gray-50 rounded-lg"
                      >
                        Minhas Consultas
                      </Link>
                      <Link
                        href="/triagem"
                        className="p-2 text-[#004E6E] font-semibold hover:bg-gray-50 rounded-lg"
                      >
                        Triagem
                      </Link>
                      <Link
                        href="/perfil"
                        className="p-2 text-[#004E6E] font-semibold hover:bg-gray-50 rounded-lg"
                      >
                        Meu Perfil
                      </Link>

                      {/* 👇 BOTÃO SAIR COM EFEITO NO MOBILE 👇 */}
                      <button
                        onClick={handleLogout}
                        disabled={saindo}
                        className={`p-2 text-left flex items-center gap-2 rounded-lg transition-colors ${saindo ? "text-gray-400 cursor-not-allowed" : "text-red-500 font-semibold hover:bg-gray-50"}`}
                      >
                        {saindo ? (
                          <>
                            <span className="animate-spin">⏳</span> Saindo...
                          </>
                        ) : (
                          "Sair"
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="p-2 text-[#004E6E] hover:bg-gray-50 rounded-lg"
                      >
                        Login
                      </Link>
                      <Link
                        href="/cadastro"
                        className="p-2 bg-[#004E6E] text-white text-center rounded-lg mt-2"
                      >
                        Cadastre-se
                      </Link>
                    </>
                  )}
                </nav>
              )}
            </header>

            {/* LINHA DE CORES NO TOPO */}
            <div className="w-full flex h-1 md:h-1.5 z-40 relative">
              <div className="w-1/4 bg-[#8C918E]"></div>
              <div className="w-1/4 bg-[#FDF4F7]"></div>
              <div className="w-1/4 bg-[#F0F9FA]"></div>
              <div className="w-1/4 bg-[#B5E9F9]"></div>
            </div>
          </>
        )}

        <main className="flex-1">{children}</main>

        {!isAdmin && !isAuthPage && (
          <>
            {/* LINHA DE CORES NO RODAPÉ */}
            <div className="w-full flex h-1 md:h-1.5 mt-auto">
              <div className="w-1/4 bg-[#8C918E]"></div>
              <div className="w-1/4 bg-[#FDF4F7]"></div>
              <div className="w-1/4 bg-[#F0F9FA]"></div>
              <div className="w-1/4 bg-[#B5E9F9]"></div>
            </div>

            <footer className="bg-gray-100 border-t border-gray-200 text-sm text-gray-500 px-4 md:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <span className="text-lg font-bold text-[#004E6E]">Sensus</span>
                <span className="text-xs md:text-sm">
                  © 2024 Clínica Universitária de Psicologia. Comprometidos com
                  o bem-estar mental e a excelência acadêmica.
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm">
                <Link href="#" className="hover:text-gray-800">
                  Política de Privacidade
                </Link>
                <Link href="#" className="hover:text-gray-800">
                  Termos de Serviço
                </Link>
                <Link href="#" className="hover:text-gray-800">
                  Contatos de Emergência
                </Link>
              </div>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
