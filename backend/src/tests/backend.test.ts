import { describe, it, expect } from "vitest";
import { BancoCaixote } from "../simulators/caixote.simulator.js";
import { BancoBMJ } from "../simulators/bmj.simulator.js";
import { simulacaoSchema } from "../validators/simulation.validator.js";
import { calcularParcelaPrice } from "../utils/finance.js";
import { SimulacaoService } from "../services/simulation.service.js";

describe("Desafio Octafin - Testes Automatizados", () => {
  const mockEntrada = {
    nome: "Antonio",
    email: "antonio@teste.com",
    cpf: "12345678909",
    cnpj: "12345678901234",
    valorEmprestimo: 1000,
    parcelas: 12,
    salario: 5000
  };

  describe("Banco Caixote", () => {
    const caixote = new BancoCaixote();

    it("1. Deve aprovar solicitação válida", async () => {
      const res = await caixote.simular(mockEntrada);
      expect(res.status).toBe("Aprovado");
      expect(res.valorParcela).toBeGreaterThan(0);
    });

    it("2. Deve reprovar por prazo excedido (> 48)", async () => {
      const res = await caixote.simular({ ...mockEntrada, parcelas: 50 });
      expect(res.status).toBe("Reprovado");
      expect(res.motivo).toContain("prazo máximo");
    });

    it("3. Deve reprovar por margem consignável (> 30%)", async () => {
      const res = await caixote.simular({ ...mockEntrada, valorEmprestimo: 100000 });
      expect(res.status).toBe("Reprovado");
      expect(res.motivo).toContain("excede a margem consignável");
    });
  });

  describe("Banco BMJ", () => {
    const bmj = new BancoBMJ();

    it("4. Deve aprovar solicitação válida", async () => {
      const res = await bmj.simular(mockEntrada);
      expect(res.status).toBe("Aprovado");
    });

    it("5. Deve reprovar por prazo excedido (> 72)", async () => {
      const res = await bmj.simular({ ...mockEntrada, parcelas: 80 });
      expect(res.status).toBe("Reprovado");
    });

    it("6. Deve reprovar por margem consignável (> 35%)", async () => {
      const res = await bmj.simular({ ...mockEntrada, valorEmprestimo: 100000 });
      expect(res.status).toBe("Reprovado");
    });
  });

  describe("Validações Zod", () => {
    it("7. Deve rejeitar CPF inválido", () => {
      const res = simulacaoSchema.safeParse({ ...mockEntrada, cpf: "11111111111" });
      expect(res.success).toBe(false);
    });

    it("8. Deve rejeitar CNPJ inválido", () => {
      const res = simulacaoSchema.safeParse({ ...mockEntrada, cnpj: "00000000000000" });
      expect(res.success).toBe(false);
    });

    it("9. Deve rejeitar salário ou valor negativo", () => {
      const res = simulacaoSchema.safeParse({ ...mockEntrada, salario: -100, valorEmprestimo: -500 });
      expect(res.success).toBe(false);
    });
  });

  describe("SimulacaoService (Timeout e Resiliência)", () => {
    it("10. A falha de um banco não deve impedir o retorno do outro", async () => {
      const servico = new SimulacaoService([new BancoCaixote(), new BancoBMJ()]);
      const res = await servico.processarSimulacoes({ ...mockEntrada, cpf: "12345678900" }); 
      
      expect(res[0]?.status).toBe("Indisponivel"); 
      expect(res[1]?.status).toBe("Aprovado");     
    });

    it("11. Deve retornar Indisponivel se o banco causar Timeout", async () => {
      const bancoLento = {
        nome: "Banco Lento",
        simular: () => new Promise<any>((resolve) => setTimeout(resolve, 4000))
      };
      const servico = new SimulacaoService([bancoLento]);
      const res = await servico.processarSimulacoes(mockEntrada);
      
      expect(res[0]?.status).toBe("Indisponivel");
      expect(res[0]?.motivo).toContain("Timeout");
    });
  });

  describe("Matemática Financeira", () => {
    it("12. Deve calcular a Tabela Price corretamente, incluindo juros zero", () => {
      const parcelaJurosZero = calcularParcelaPrice(1000, 0, 10);
      expect(parcelaJurosZero).toBe(100);

      const parcelaNormal = calcularParcelaPrice(1000, 0.0145, 48);
      expect(parcelaNormal).toBe(29.06);
    });
  });
});