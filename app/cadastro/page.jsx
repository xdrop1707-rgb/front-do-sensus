"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [curso, setCurso] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  
  const supabase = createClient();
  const router = useRouter();

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
          telefone: telefone,
          data_nascimento: dataNascimento,
          tipo: "cliente",
        },
      },
    });

    if (error) {
      setMensagem(`Erro: ${error.message}`);
      setCarregando(false);
      return;
    }

    if (data.user) {
      const { data: usuarioPublico } = await supabase
        .from("usuarios")
        .select("id")
        .eq("auth_user_id", data.user.id)
        .single();

      if (usuarioPublico) {
        await supabase.from("clientes").insert({
          id_usuario: usuarioPublico.id,
          curso: curso,
          periodo: periodo,
          status_tratamento: "triagem",
        });
      }
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
    <div className="max-w-2xl mx-auto px-8 py-16">
      <h1 className="text-3xl font-bold text-sensus-primary mb-2">Criar Conta</h1>
      <p className="text-sensus-muted mb-8">Preencha seus dados para começar.</p>

      {mensagem && (
        <div className={`p-4 rounded-lg mb-6 text-sm ${mensagem.includes("Erro") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {mensagem}
        </div>
      )}

      <form onSubmit={handleCadastro} className="bg-white border border-sensus-border rounded-2xl p-8 space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Nome Completo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="João da Silva" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joao@universidade.edu.br" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full border border-sensus-border rounded-lg px-4 py-3" required minLength={6} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Data de Nascimento</label>
            <input type="date" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Curso</label>
            <input type="text" value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Ex: Psicologia" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Período</label>
            <input type="text" value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="Ex: 3º Ano" className="w-full border border-sensus-border rounded-lg px-4 py-3" required />
          </div>
        </div>

        <button type="submit" disabled={carregando} className="w-full bg-sensus-primary text-white rounded-full py-3 font-semibold hover:opacity-90 disabled:opacity-50 mt-4">
          {carregando ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <p className="text-sm text-sensus-muted mt-6 text-center">
        Já tem conta? <Link href="/login" className="text-sensus-primary font-semibold">Faça login</Link>
      </p>
    </div>
  );
}