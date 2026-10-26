"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const supabase = createClient();;

   const handleCadastro = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setMensagem("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome: nome,
          tipo: 'cliente', 
        },
      },
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      setCarregando(false);
      return;
    }

    if (data.user && !data.session) {
      setMensagem("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
    } else {
      
      setMensagem("Cadastro realizado com sucesso! Redirecionando...");
      router.push("/login"); 
    }
    setCarregando(false);
  };

  return (
    <div className="max-w-md mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-sensus-primary mb-2">Criar Conta</h1>
      <p className="text-sensus-muted mb-8">Preencha seus dados para começar.</p>

      {mensagem && (
        <div className={`p-4 rounded-lg mb-6 text-sm ${mensagem.includes("Erro") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleCadastro} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Nome Completo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">E-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@universidade.edu.br" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full border border-sensus-border rounded-lg px-4 py-3" required minLength={6} />
        </div>
        <button type="submit" disabled={carregando} className="w-full bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50">
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="text-sm text-sensus-muted mt-6 text-center">
        Já tem conta? <Link href="/login" className="text-sensus-primary font-semibold">Faça login</Link>
      </p>
    </div>
  );
}