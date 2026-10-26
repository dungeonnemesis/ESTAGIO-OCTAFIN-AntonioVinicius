# Simulador de Empréstimo Consignado

## Descrição do Projeto
Este repositório contém a minha solução para o desafio técnico da Octafin. O projeto é uma aplicação full-stack desenvolvida para simular propostas de empréstimo consignado, consumindo APIs fictícias de bancos parceiros (Banco Caixote e Banco BMJ). 

O foco principal do desenvolvimento foi aplicar regras de negócio financeiras reais (Cálculo de Tabela Price, validação de margem consignável) e garantir que o sistema seja tolerante a falhas (resiliente) diante de integrações externas instáveis.

## Tecnologias Utilizadas
- **Frontend:** React, TypeScript, CSS Modules.
- **Backend:** Node.js, Express, TypeScript.
- **Validação:** Zod.
- **Testes Automatizados:** Vitest.

## Arquitetura e Decisões Técnicas
A base de código foi estruturada visando o isolamento de responsabilidades e a facilidade de manutenção:
- **Simulators:** Classes independentes que implementam a mesma interface, isolando as particularidades e regras de negócio de cada instituição financeira.
- **Service:** A camada de serviço orquestra as chamadas aos bancos utilizando processamento concorrente. Foi implementado um padrão de timeout para evitar que requisições presas prejudiquem a experiência do usuário.
- **Validators & Utils:** Isolamento das regras matemáticas financeiras e de validação de documentos, mantendo os controllers limpos.

## Regras de Negócio Implementadas
- **Banco Caixote:** Taxa de 1,45% a.m. | Margem máxima de 30% | Prazo máximo de 48 meses. (Simula erro 503 se o CPF terminar em 0).
- **Banco BMJ:** Taxa de 2,10% a.m. | Margem máxima de 35% | Prazo máximo de 72 meses.

## Como Executar
1. Certifique-se de ter o Node.js (v18+) instalado na máquina.
2. Clone o repositório e acesse a pasta raiz.
3. Instale as dependências do backend e do frontend:
   - No terminal, acesse `/backend` e rode `npm install`.
   - Em outro terminal, acesse `/frontend` e rode `npm install`.
4. Para rodar a aplicação:
   - No `/backend`, execute `npm run dev`.
   - No `/frontend`, execute `npm run dev`.
5. Para rodar a suíte de testes (Vitest), acesse a pasta do backend e execute `npm run test`.

## Melhorias Implementadas

**Problema:** Propostas que excediam a margem consignável ou o prazo máximo ainda processavam a matemática financeira e devolviam valores parciais, gerando risco de compliance e confusão no frontend.
**Proposta:** Refatoração do fluxo interno dos simuladores para realizar a técnica de "early return". Se a proposta falha na verificação de limite ou margem, o cálculo é imediatamente abortado.
**Por quê:** Garante que o cliente nunca veja valores de juros ou parcelas de uma proposta que não pode ser aprovada, melhorando a clareza e evitando processos ou insatisfação.

**Problema:** A falha de comunicação com apenas um banco (como o erro 503 do Banco Caixote) resultava em erro no serviço inteiro, impedindo o cliente de ver a oferta do banco que estava funcionando.
**Proposta:** Substituição de chamadas sequenciais por `Promise.allSettled()` junto a um mecanismo de `Promise.race()` configurado com um timeout de 3 segundos, limpando os temporizadores da memória via `clearTimeout`.
**Por quê:** Isola a indisponibilidade. Se o sistema de um parceiro cair, o usuário final não percebe a falha na infraestrutura geral e continua conseguindo simular e fechar negócio com as opções disponíveis.

**Problema:** A API estava vulnerável a receber dados sujos do frontend, causando retornos de `NaN` na matemática financeira e possíveis quebras de servidor.
**Proposta:** Criação de um schema rigoroso com Zod, validando não apenas tipos e limites (valores positivos), mas aplicando cálculo real de dígito verificador para CPF e CNPJ, além de coerção de tipos numéricos.
**Por quê:** O backend passa a rejeitar requisições inválidas de forma antecipada e segura, poupando processamento e mantendo a integridade das operações.

## Melhorias Planejadas (Próximos Passos)

1. **Problema:** A API de simulação processa as requisições de forma síncrona. Em um cenário de alto tráfego (Black Friday, por exemplo), o servidor seguraria muitas conexões HTTP abertas esperando a resposta dos bancos parceiros, o que poderia esgotar o event loop do Node.js.
   **Proposta:** Alterar a arquitetura para orientada a eventos utilizando filas (RabbitMQ ou SQS). A requisição apenas enfileira o pedido e o frontend fica escutando o resultado final via WebSockets ou Long Polling.
   **Por quê:** Permite escalar o backend horizontalmente, suportando milhares de simulações simultâneas sem derrubar a aplicação.

2. **Problema:** Usuários podem perder o preenchimento de formulários longos em caso de recarregamento acidental da página ou oscilação de rede no dispositivo móvel.
   **Proposta:** Implementação de cache temporário no `localStorage` ou via Context API/Zustand no frontend para manter o rascunho da digitação em andamento.
   **Por quê:** Reduz o atrito de uso e melhora diretamente a taxa de conversão do funil de vendas.

3. **Problema:** Rotas públicas de simulação financeira são alvos comuns de bots e scripts maliciosos.
   **Proposta:** Implementação de middlewares de segurança como `express-rate-limit` para barrar excesso de chamadas pelo mesmo IP e o pacote `helmet` para proteção de headers HTTP.
   **Por quê:** Evita ataques de negação de serviço (DDoS) e sobrecarga na infraestrutura, além de proteger contra varreduras automatizadas.