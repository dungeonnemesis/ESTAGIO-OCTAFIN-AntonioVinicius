import type { EntradaSimulacao, SaidaSimulacao } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export class ErroValidacao extends Error {
  campos: Record<string, string[]>;
  constructor(campos: Record<string, string[]>) {
    super("Dados inválidos");
    this.campos = campos;
  }
}

export async function simular(dados: EntradaSimulacao): Promise<SaidaSimulacao[]> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}/simular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
  }

  const corpo = await resposta.json().catch(() => null);

  if (resposta.status === 400 && corpo?.erros) throw new ErroValidacao(corpo.erros);
  if (!resposta.ok) {
    throw new Error(corpo?.erro ?? "Serviço indisponível. Tente novamente em instantes.");
  }
  return corpo as SaidaSimulacao[];
}