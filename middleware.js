import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function middleware(request) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Pega o usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas que o PACIENTE acessa (precisa estar logado)
  const rotasProtegidas = ["/triagem", "/agendamento"];

  // Rotas que o PROFISSIONAL acessa (precisa estar logado E ser psicologo/admin)
  const rotasAdmin = ["/admin"];

  const rotaAtual = request.nextUrl.pathname;

  // --- REGRA 1: Rotas do Paciente ---
  if (rotasProtegidas.some((rota) => rotaAtual.startsWith(rota)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", rotaAtual);
    return NextResponse.redirect(url);
  }

  // --- REGRA 2: Rotas do Admin ---
  if (rotasAdmin.some((rota) => rotaAtual.startsWith(rota))) {
    // 2.1 - Se não estiver logado, vai pro login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", rotaAtual);
      return NextResponse.redirect(url);
    }

    // 2.2 - TESTE: Deixar passar se for o seu ID de teste
    // (Substitua pelo seu ID real que está no Supabase)
    if (user.email === "adrianofreitas@gmail.com") {
      return response; // Libera a entrada!
    }

    // 2.3 - Se não for você, busca o tipo no banco (regra antiga)
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("tipo")
      .eq("id", user.id)
      .single();

    if (usuario?.tipo !== "psicologo" && usuario?.tipo !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/triagem/:path*", "/agendamento/:path*", "/admin/:path*"],
};
