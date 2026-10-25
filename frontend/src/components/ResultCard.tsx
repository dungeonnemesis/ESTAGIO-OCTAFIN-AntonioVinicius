import type { SaidaSimulacao } from "../types";
import { brl } from "../utils/format";

const rotulos = {
  Aprovado: "Aprovado",
  Reprovado: "Não aprovado",
  Indisponivel: "Indisponível no momento",
};

interface Props {
  resultado: SaidaSimulacao;
  salario: number;
  melhorOferta: boolean;
}

export function ResultCard({ resultado: r, salario, melhorOferta }: Props) {
  const comprometimento =
    r.valorParcela !== undefined && salario > 0
      ? Math.round((r.valorParcela / salario) * 100)
      : null;

  return (
    <article className={`card card--${r.status.toLowerCase()}`}>
      {melhorOferta && <span className="badge">Menor custo total</span>}
      <h3>{r.banco}</h3>
      <p className="status">{rotulos[r.status]}</p>

      {r.status === "Aprovado" && r.valorParcela !== undefined && r.valorTotal !== undefined && (
        <dl>
          <div><dt>Parcela</dt><dd>{brl(r.valorParcela)}</dd></div>
          <div><dt>Total a pagar</dt><dd>{brl(r.valorTotal)}</dd></div>
          {r.taxaJurosMensal !== undefined && (
            <div><dt>Juros ao mês</dt><dd>{(r.taxaJurosMensal * 100).toFixed(2)}%</dd></div>
          )}
          {comprometimento !== null && (
            <div><dt>Compromete do salário</dt><dd>{comprometimento}%</dd></div>
          )}
        </dl>
      )}

      {r.motivo && <p className="motivo">{r.motivo}</p>}
    </article>
  );
}