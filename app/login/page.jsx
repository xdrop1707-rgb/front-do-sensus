"use client";

import { useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        setMensagem("E-mail ou senha incorretos. Verifique seus dados.");
      } else if (error.message.includes("Email not confirmed")) {
        setMensagem("Por favor, confirme seu e-mail antes de fazer login.");
      } else {
        setMensagem(`Erro ao entrar: ${error.message}`);
      }
      setCarregando(false);
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("tipo")
      .eq("email", email)
      .single();

    let destino = redirectUrl;

    if (usuario?.tipo === "psicologo" || usuario?.tipo === "admin") {
      destino = "/admin";
    } else {
      destino = "/";
    }

    router.push(destino);
    router.refresh();
    setCarregando(false);
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      {/* LADO ESQUERDO: Imagem */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#004E6E]">
        <Image
          src="/clinica.jpg"
          alt="Clínica Sensus"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#004E6E]/60"></div>

        <div className="absolute inset-0 flex flex-col justify-end p-12 z-10">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Seu bem-estar mental
              <br />
              em primeiro lugar.
            </h2>
            <p className="text-blue-100 text-lg max-w-md">
              Acesse sua conta para gerenciar suas consultas, acompanhar seus
              feedbacks e cuidar da sua saúde mental.
            </p>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center p-6 md:p-12 bg-[#F9FAFB]">
        {/* 👇 AQUI ESTÁ A MÁGICA: LOGO FIXA NO TOPO DA TELA 👇 */}
        <div className="absolute top-8 left-0 w-full flex justify-center lg:justify-start lg:pl-12">
          <Link href="/">
            {/* Como o fundo aqui é branco, o quadrado branco da imagem desaparece */}
            <Image
              src="/logo.png"
              alt="Sensus"
              width={160}
              height={40}
              className="object-contain hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        {/* O formulário continua no meio da tela */}
        <div className="w-full max-w-md mt-12 lg:mt-0">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <h1 className="text-2xl md:text-3xl font-bold text-[#004E6E] mb-2 text-center">
              Entrar
            </h1>
            <p className="text-gray-500 mb-8 text-sm md:text-base text-center">
              Bem-vindo de volta! Digite suas credenciais.
            </p>

            {mensagem && (
              <div className="p-3 rounded-lg mb-6 text-sm bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                <span>⚠️</span> {mensagem}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                  E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="joao@universidade.edu.br"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#004E6E] focus:border-[#004E6E] outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                  Senha
                </label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#004E6E] focus:border-[#004E6E] outline-none transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full flex justify-center items-center gap-2 bg-[#004E6E] text-white rounded-xl py-3.5 font-semibold hover:bg-[#003a52] disabled:opacity-50 transition-all mt-2"
              >
                {carregando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Entrando...
                  </>
                ) : (
                  "Acessar Conta"
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-8 text-center">
              Ainda não tem uma conta?{" "}
              <Link
                href="/cadastro"
                className="text-[#00a3c4] font-semibold hover:underline"
              >
                Cadastre-se grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
          <div className="w-12 h-12 border-4 border-[#004E6E] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 mt-4 font-semibold">Carregando...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
