// app/layout.jsx
"use client"; // <-- Adicionado para podermos ler a URL

import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation"; // <-- Importado

// Nota: O metadata não funciona em Client Components,
// então removemos daqui e ele pode ser adicionado em cada página depois.

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Verifica se estamos na área do admin
  const isAdmin = pathname.startsWith("/admin");

  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-[#F9FAFB]">
        {/* CABEÇALHO: Só mostra se NÃO for admin */}
        {!isAdmin && (
          <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Sensus Logo"
                width={160}
                height={40}
                className="object-contain"
              />
            </Link>

            <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
              <Link
                href="/especialistas"
                className="text-[#004E6E] font-semibold border-b-2 border-[#004E6E] pb-1"
              >
                Agendamentos
              </Link>
              <Link href="#" className="hover:text-[#004E6E]">
                Serviços
              </Link>
              <Link href="#" className="hover:text-[#004E6E]">
                Nossa Clínica
              </Link>
              <Link href="#" className="hover:text-[#004E6E]">
                Recursos
              </Link>

              <div className="w-px h-6 bg-gray-300 mx-2"></div>

              <Link href="/login" className="text-[#004E6E] hover:opacity-80">
                Login do Paciente
              </Link>
              <Link
                href="/cadastro"
                className="bg-[#004E6E] text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition"
              >
                Portal da Equipe
              </Link>
            </nav>
          </header>
        )}
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Sensus - Portal do Paciente",
  description: "Bem-estar mental em primeiro lugar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-[#F9FAFB]">
        {/* Cabeçalho */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* Logo */}
            <Image 
              src="/logo.png" 
              alt="Sensus Logo" 
              width={160} 
              height={40} 
              className="object-contain"
            />
          </Link>
          
          <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/especialistas" className="text-[#004E6E] font-semibold border-b-2 border-[#004E6E] pb-1">
              Agendamentos
            </Link>
            <Link href="#" className="hover:text-[#004E6E]">Serviços</Link>
            <Link href="#" className="hover:text-[#004E6E]">Nossa Clínica</Link>
            <Link href="#" className="hover:text-[#004E6E]">Recursos</Link>
            
            <div className="w-px h-6 bg-gray-300 mx-2"></div>
            
            <Link href="/login" className="text-[#004E6E] hover:opacity-80">
              Login do Paciente
            </Link>
            <Link href="/cadastro" className="bg-[#004E6E] text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition">
              Portal da Equipe
            </Link>
          </nav>
        </header>

        {/* Conteúdo */}
        <main className="flex-1">{children}</main>

        {/* RODAPÉ: Só mostra se NÃO for admin */}
        {!isAdmin && (
          <footer className="bg-gray-100 border-t border-gray-200 text-sm text-gray-500 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-[#004E6E]">Sensus</span>
              <span>
                © 2024 Clínica Universitária de Psicologia. Comprometidos com o
                bem-estar mental e a excelência acadêmica.
              </span>
            </div>
            <div className="flex gap-4">
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
        )}
      </body>
    </html>
  );
}
        {/* Rodapé */}
        <footer className="bg-gray-100 border-t border-gray-200 text-sm text-gray-500 px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#004E6E]">Sensus</span>
            <span>© 2024 Clínica Universitária de Psicologia. Comprometidos com o bem-estar mental e a excelência acadêmica.</span>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-gray-800">Política de Privacidade</Link>
            <Link href="#" className="hover:text-gray-800">Termos de Serviço</Link>
            <Link href="#" className="hover:text-gray-800">Contatos de Emergência</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
