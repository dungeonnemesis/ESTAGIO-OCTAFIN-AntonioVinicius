import { useState} from 'react';

// Tipagem baseada no que construímos no Backend
interface SaidaSimulacao {
  banco: string;
  status: "Aprovado" | "Reprovado" | "Indisponivel";
  taxaJurosMensal?: number;
  valorParcela?: number;
  valorTotal?: number;
  motivo?: string;
}

export default function App() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState<SaidaSimulacao[]>([]);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    nome: '', email: '', cpf: '', cnpj: '',
    valorEmprestimo: 1000, salario: 3000, parcelas: 12
  });

  // Função que envia os dados para o Backend
  const realizarSimulacao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    setResultados([]);

    try {
      // Faz o POST para o nosso servidor na porta 3000
      const resposta = await fetch('http://localhost:3000/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valorEmprestimo: Number(formData.valorEmprestimo),
          salario: Number(formData.salario),
          parcelas: Number(formData.parcelas)
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        // Se o Zod barrou, mostramos o erro
        throw new Error(dados.erros ? 'Verifique os dados enviados (CPF/CNPJ inválido ou valores incorretos).' : dados.erro);
      }

      setResultados(dados);
    } catch (err: any) {
      setErro(err.message || 'Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>💸 Simulador de Empréstimo</h1>
      
      <form onSubmit={realizarSimulacao} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <input placeholder="Nome Completo" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
        <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input placeholder="CPF (Apenas números)" required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
        <input placeholder="CNPJ da Empresa (Apenas números)" required value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
        
        <label>Valor do Empréstimo (R$):
          <input type="number" min="1" required value={formData.valorEmprestimo} onChange={e => setFormData({...formData, valorEmprestimo: Number(e.target.value)})} />
        </label>
        
        <label>Salário (R$):
          <input type="number" min="1" required value={formData.salario} onChange={e => setFormData({...formData, salario: Number(e.target.value)})} />
        </label>

        <label>Parcelas (1 a 72):
          <input type="number" min="1" max="72" required value={formData.parcelas} onChange={e => setFormData({...formData, parcelas: Number(e.target.value)})} />
        </label>

        <button type="submit" disabled={carregando} style={{ padding: '10px', cursor: 'pointer' }}>
          {carregando ? 'A simular nos bancos...' : 'Simular Empréstimo'}
        </button>
      </form>

      {erro && <p style={{ color: 'red' }}><strong>Erro:</strong> {erro}</p>}

      {resultados.length > 0 && (
        <div>
          <h2>Resultados da Simulação:</h2>
          {resultados.map((resultado, index) => (
            <div key={index} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
              <h3>{resultado.banco}</h3>
              <p><strong>Status:</strong> {resultado.status}</p>
              
              {resultado.status === 'Aprovado' && (
                <>
                  <p><strong>Taxa de Juros:</strong> {(resultado.taxaJurosMensal! * 100).toFixed(2)}% ao mês</p>
                  <p><strong>Valor da Parcela:</strong> R$ {resultado.valorParcela?.toFixed(2)}</p>
                  <p><strong>Valor Total:</strong> R$ {resultado.valorTotal?.toFixed(2)}</p>
                </>
              )}

              {resultado.status !== 'Aprovado' && (
                <p><strong>Motivo:</strong> {resultado.motivo}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}