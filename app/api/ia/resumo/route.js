// app/api/ia/resumo/route.js
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// Inicializa a IA com a chave do .env.local
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const { texto } = await request.json();

    if (!texto) {
      return NextResponse.json({ error: "Texto não enviado" }, { status: 400 });
    }

    const prompt = `
      Você é um assistente clínico de psicologia.
      Leia as anotações abaixo e gere um resumo profissional e conciso (máximo 3 parágrafos).
      Destaque os principais pontos: humor, temas discutidos e evolução do paciente.
      
      Anotações:
      ${texto}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    return NextResponse.json({ resumo: response.text });
  } catch (error) {
    console.error("Erro na IA:", error);
    return NextResponse.json(
      { error: "Erro ao gerar resumo" },
      { status: 500 },
    );
  }
}
