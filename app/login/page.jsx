"use client";

import { useState, Suspense } from "react"; 
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
      setMensagem(`Erro: ${error.message}`);
    } else {
      router.push(redirectUrl);
      router.refresh(); 
    }
    setCarregando(false);
  };

  return (
    <div className="max-w-md mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-sensus-primary mb-2">Entrar</h1>
      <p className="text-sensus-muted mb-8">Acesse sua conta para agendar consultas.</p>

      {mensagem && (
        <div className="p-4 rounded-lg mb-6 text-sm bg-red-100 text-red-700">
          {mensagem}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">E-mail</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="joao@universidade.edu.br" 
            className="w-full border border-sensus-border rounded-lg px-4 py-3" 
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Senha</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="••••••••" 
            className="w-full border border-sensus-border rounded-lg px-4 py-3" 
            required 
          />
        </div>
        <button 
          type="submit" 
          disabled={carregando} 
          className="w-full bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-sm text-sensus-muted mt-6 text-center">
        Não tem conta? <Link href="/cadastro" className="text-sensus-primary font-semibold">Cadastre-se</Link>
      </p>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="text-center py-16">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}