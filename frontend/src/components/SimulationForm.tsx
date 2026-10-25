import { useState } from "react";
import type { FormEvent } from "react";
import type { EntradaSimulacao } from "../types";
import { brl, maskCPF, maskCNPJ, apenasNumeros } from "../utils/format";

interface Props {
  carregando: boolean;
  onSubmit: (dados: EntradaSimulacao) => void;
}

interface Estado {
  nome: string;
  email: string;
  cpf: string;
  cnpj: string;
  salario: string;
  valorEmprestimo: number;
  parcelas: number;
}

export function SimulationForm({ carregando, onSubmit }: Props) {
  const [dados, setDados] = useState<Estado>({
    nome: "",
    email: "",
    cpf: "",
    cnpj: "",
    salario: "3000",
    valorEmprestimo: 5000,
    parcelas: 24,
  });

  const atualizar = (campo: keyof Estado, valor: string | number) =>
    setDados((atual) => ({ ...atual, [campo]: valor }));

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      nome: dados.nome.trim(),
      email: dados.email.trim(),
      cpf: apenasNumeros(dados.cpf),
      cnpj: apenasNumeros(dados.cnpj),
      salario: Number(dados.salario),
      valorEmprestimo: dados.valorEmprestimo,
      parcelas: dados.parcelas,
    });
  };

  return (
    <form className="painel formulario" onSubmit={enviar}>
      <label className="campo">
        Nome completo
        <input type="text" required placeholder="Maria da Silva"
          value={dados.nome} onChange={(e) => atualizar("nome", e.target.value)} />
      </label>

      <label className="campo">
        E-mail
        <input type="email" required placeholder="maria@email.com"
          value={dados.email} onChange={(e) => atualizar("email", e.target.value)} />
      </label>

      <label className="campo">
        CPF
        <input type="text" inputMode="numeric" required placeholder="000.000.000-00"
          value={dados.cpf} onChange={(e) => atualizar("cpf", maskCPF(e.target.value))} />
      </label>

      <label className="campo">
        CNPJ do empregador
        <input type="text" inputMode="numeric" required placeholder="00.000.000/0000-00"
          value={dados.cnpj} onChange={(e) => atualizar("cnpj", maskCNPJ(e.target.value))} />
      </label>

      <label className="campo">
        Salário mensal (R$)
        <input type="number" min={1} required
          value={dados.salario} onChange={(e) => atualizar("salario", e.target.value)} />
      </label>

      <label className="campo">
        <span className="campo-linha">
          Valor do empréstimo <span className="campo-valor">{brl(dados.valorEmprestimo)}</span>
        </span>
        <input type="range" min={500} max={50000} step={500}
          value={dados.valorEmprestimo}
          onChange={(e) => atualizar("valorEmprestimo", Number(e.target.value))} />
      </label>

      <label className="campo">
        <span className="campo-linha">
          Prazo <span className="campo-valor">{dados.parcelas}x</span>
        </span>
        <input type="range" min={1} max={72} step={1}
          value={dados.parcelas}
          onChange={(e) => atualizar("parcelas", Number(e.target.value))} />
      </label>

      <button className="botao" type="submit" disabled={carregando}>
        {carregando ? "Consultando bancos..." : "Simular empréstimo"}
      </button>
      <p className="aviso">Simulação gratuita e sem compromisso. Seus dados são usados apenas nesta simulação.</p>
    </form>
  );
}