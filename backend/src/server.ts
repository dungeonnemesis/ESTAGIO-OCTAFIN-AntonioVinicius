import express from "express";
import cors from "cors"; 
import { SimulacaoService } from "./services/simulation.service.js";
import { simulacaoSchema } from "./validators/simulation.validator.js";
import { BancoCaixote } from "./simulators/caixote.simulator.js";
import { BancoBMJ } from "./simulators/bmj.simulator.js";

const app = express();
const porta = 3000;

app.use(cors()); // 
app.use(express.json());

app.post("/simular", async (req, res) => {
  // 1. Validação Segura (safeParse não quebra a aplicação, ele retorna 'success: true/false')
  const validacao = simulacaoSchema.safeParse(req.body);

  if (!validacao.success) {
  const erros: Record<string, string[]> = {};
  for (const issue of validacao.error.issues) {
    const campo = issue.path.join(".") || "geral";
    (erros[campo] ??= []).push(issue.message);
  }
  return res.status(400).json({ erros });
}

  try {
    // 2. Instancia os bancos disponíveis
    const bancos = [new BancoCaixote(), new BancoBMJ()];

    // 3. Injeta a lista de bancos no Serviço (Injeção de Dependência)
    const servico = new SimulacaoService(bancos);
    
    // 4. Repassa apenas os dados limpos e validados (validacao.data) para o gerente processar
    const resultados = await servico.processarSimulacoes(validacao.data);
    
    res.status(200).json(resultados);
  } catch (erro) {
  console.error("Falha ao processar simulação:", erro);
  res.status(500).json({ erro: "Erro interno no processamento das simulações" });
}
});

app.listen(porta, () => {
  console.log(`🚀 Servidor rodando na porta ${porta}`);
});