import { useState } from "react";
import { SimulationForm } from "./components/SimulationForm";
import { ResultCard } from "./components/ResultCard";
import { simular, ErroValidacao } from "./api";
import type { EntradaSimulacao, SaidaSimulacao } from "./types";
import "./App.css";

export default function App() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [camposInvalidos, setCamposInvalidos] = useState<Record<string, string[]>>({});
  const [resultados, setResultados] = useState<SaidaSimulacao[]>([]);
  const [ultimaEntrada, setUltimaEntrada] = useState<EntradaSimulacao | null>(null);

  const realizarSimulacao = async (entrada: EntradaSimulacao) => {
    setCarregando(true);
    setErro("");
    setCamposInvalidos({});
    setResultados([]);
    setUltimaEntrada(entrada);

    try {
      setResultados(await simular(entrada));
    } catch (err) {
      if (err instanceof ErroValidacao) setCamposInvalidos(err.campos);
      else setErro(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setCarregando(false);
    }
  };

  // Melhor oferta: menor valor total entre os aprovados (só faz sentido com 2 ou mais)
  const aprovados = resultados.filter(
    (r) => r.status === "Aprovado" && r.valorTotal !== undefined
  );
  const melhor =
    aprovados.length > 1
      ? aprovados.reduce((a, b) => (a.valorTotal! <= b.valorTotal! ? a : b))
      : null;

  const temIndisponivel = resultados.some((r) => r.status === "Indisponivel");
  const salario = ultimaEntrada?.salario ?? 0;

  return (
    <main className="pagina">
      <header className="topo">
        <span className="selo">Simulador de consignado</span>
        <h1>
          Compare seu <span className="destaque">crédito consignado</span>
        </h1>
        <p>Preencha os dados e veja, em segundos, a resposta de cada banco parceiro.</p>
      </header>

      <div className="layout">
        <SimulationForm carregando={carregando} onSubmit={realizarSimulacao} />

        <section className="resultados" aria-live="polite">
          {Object.keys(camposInvalidos).length > 0 && (
            <div className="alerta" role="alert">
              <strong>Confira os dados enviados:</strong>
              <ul>
                {Object.entries(camposInvalidos).map(([campo, msgs]) => (
                  <li key={campo}>{campo}: {msgs.join(", ")}</li>
                ))}
              </ul>
            </div>
          )}

          {erro && <div className="alerta" role="alert">{erro}</div>}

          {carregando && (
            <>
              <div className="skeleton" />
              <div className="skeleton" />
            </>
          )}

          {!carregando && resultados.length === 0 && !erro &&
            Object.keys(camposInvalidos).length === 0 && (
              <p className="vazio">Os resultados dos bancos vão aparecer aqui.</p>
          )}

          {resultados.map((r) => (
            <ResultCard key={r.banco} resultado={r} salario={salario} melhorOferta={r === melhor} />
          ))}

          {temIndisponivel && ultimaEntrada && !carregando && (
            <button className="botao botao-secundario"
              onClick={() => realizarSimulacao(ultimaEntrada)}>
              Tentar novamente
            </button>
          )}
        </section>
      </div>

      <footer className="rodape">
        Ambiente de demonstração: os bancos e os dados são fictícios.
      </footer>
    </main>
  );
}