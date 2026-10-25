import { describe, it, expect } from "vitest";
import { SimulacaoService } from "./simulation.service.js";
import type { SimuladorBanco } from "../simulators/simulator.interface.js";
import type { EntradaSimulacao, SaidaSimulacao } from "../types/simulation.js"; // <-- Importamos a SaidaSimulacao

// 1. Criamos um Banco Falso que dá sempre certo
class BancoSucessoMock implements SimuladorBanco {
  readonly nome = "Banco Sucesso";
  
  // <-- Forçamos o TypeScript a saber que isto devolve uma SaidaSimulacao
  async simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao> { 
    return { 
      banco: this.nome, 
      status: "Aprovado", 
      taxaJurosMensal: 0.01, 
      valorParcela: 100, 
      valorTotal: 1000 
    };
  }
}

// 2. Criamos um Banco Falso que "explode" (simula um erro na API)
class BancoErroMock implements SimuladorBanco {
  readonly nome = "Banco Erro";
  
  // <-- Colocamos o tipo aqui também! Isto faz desaparecer o erro da sua imagem.
  async simular(entrada: EntradaSimulacao): Promise<SaidaSimulacao> { 
    throw new Error("API Falsa fora do ar");
  }
}

describe("SimulacaoService", () => {
  it("deve retornar o banco aprovado e marcar o banco que falhou como Indisponivel", async () => {
    // Injetamos os bancos falsos no serviço
    const servico = new SimulacaoService([new BancoSucessoMock(), new BancoErroMock()]);

    const dadosEntrada: EntradaSimulacao = {
      nome: "Teste", cpf: "12345678909", cnpj: "12345678901234",
      email: "teste@teste.com", valorEmprestimo: 1000, parcelas: 10, salario: 5000
    };

    const resultados = await servico.processarSimulacoes(dadosEntrada);

    expect(resultados).toHaveLength(2);

    // <-- SOLUÇÃO PARA O UNDEFINED: Retiramos os itens do array um a um (desestruturação).
    // O TypeScript agora sabe perfeitamente quem eles são. Adicionamos também o ?. por segurança.
    const [resultadoSucesso, resultadoErro] = resultados;

    expect(resultadoSucesso?.status).toBe("Aprovado");
    expect(resultadoSucesso?.banco).toBe("Banco Sucesso");

    expect(resultadoErro?.status).toBe("Indisponivel");
    expect(resultadoErro?.banco).toBe("Banco Erro");
    expect(resultadoErro?.motivo).toBe("API Falsa fora do ar");
  });
});