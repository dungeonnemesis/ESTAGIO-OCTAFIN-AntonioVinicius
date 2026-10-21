import express from "express";
import { SimulacaoService } from "./services/simulation.service.js";

const app = express();
const porta = 3000;

// Middleware: ensina o Express a ler pacotes de dados no formato JSON
app.use(express.json());

// Rota POST: o endereço de internet que vai receber as simulações
app.post("/simular", async (req, res) => {
  try {
    const servico = new SimulacaoService();
    // req.body contém os dados brutos que o cliente enviou pela internet
    const resultados = await servico.processarSimulacoes(req.body);
    
    // Se deu tudo certo, devolve a resposta com status 200 (OK)
    res.status(200).json(resultados);
  } catch (erro: any) {
    // Se o Zod (segurança) reprovar os dados, o código pula direto para cá
    // Devolvemos o erro com status 400 (Bad Request - Pedido ruim)
    res.status(400).json({ erro: erro.issues || "Erro de validação nos dados" });
  }
});

// Liga o servidor e deixa ele escutando a porta 3000
app.listen(porta, () => {
  console.log(`🚀 Servidor rodando na porta ${porta}`);
});