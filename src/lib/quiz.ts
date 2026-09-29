export type QuizQuestion = {
  prompt: string;
  options: string[];
  correctOption: number;
  explanation: string;
};

export const HIEROGLYPHS = ["𓂀", "𓃠", "𓅓", "𓆣"];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    prompt: "O endpoint funciona, mas devolve o campo 'valor' quando o contrato prometia 'impostoDevido'. Quem tem mais chance de pegar essa diferença?",
    options: [
      "Um teste de integração que chama o endpoint e confere o JSON",
      "Apenas o compilador do Java",
      "Um teste que verifica somente a conta dentro do Service",
      "O ObjectMapper, porque ele corrige nomes automaticamente",
    ],
    correctOption: 0,
    explanation: "O teste de integração enxerga o caminho completo e percebe que o JSON entregue não respeita o contrato.",
  },
  {
    prompt: "Qual situação representa melhor um teste unitário isolado?",
    options: [
      "Subir toda a aplicação e chamar uma rota HTTP",
      "Chamar diretamente um método do Service e controlar suas dependências",
      "Abrir a página no navegador e preencher o formulário",
      "Testar Controller, banco e serialização ao mesmo tempo",
    ],
    correctOption: 1,
    explanation: "O teste unitário foca uma pequena parte do código e troca dependências externas por versões controladas.",
  },
  {
    prompt: "Quando usamos @SpringBootTest, o que estamos pedindo ao teste?",
    options: [
      "Que ignore as configurações reais da aplicação",
      "Que transforme todo teste em teste unitário",
      "Que prepare o contexto da aplicação para as partes trabalharem juntas",
      "Que publique o sistema em uma porta da internet",
    ],
    correctOption: 2,
    explanation: "Ele monta o ambiente do Spring para que componentes reais possam ser usados em conjunto.",
  },
  {
    prompt: "Para que o MockMvc entra na história?",
    options: [
      "Para substituir o banco por uma planilha",
      "Para escrever automaticamente o código do Controller",
      "Para criar mocks de qualquer classe sem configuração",
      "Para simular requisições HTTP sem abrir um servidor de verdade",
    ],
    correctOption: 3,
    explanation: "Ele permite testar rotas, status e respostas como se houvesse uma chamada HTTP, mas sem abrir uma porta real.",
  },
  {
    prompt: "No nosso teste, qual é o trabalho do ObjectMapper?",
    options: [
      "Converter objetos Java para JSON e também fazer o caminho de volta",
      "Calcular o imposto do ImobFiscal",
      "Escolher qual teste será executado primeiro",
      "Substituir o MockMvc nas requisições",
    ],
    correctOption: 0,
    explanation: "Ele traduz os objetos usados no Java para o formato JSON enviado ou recebido pela API.",
  },
  {
    prompt: "Uma classe possui vários métodos com @Test. Como devemos entendê-los?",
    options: [
      "Como etapas obrigatórias de uma única história executadas em ordem",
      "Como cenários diferentes que devem conseguir rodar de forma independente",
      "Como cópias de segurança do mesmo teste",
      "Como comandos usados apenas para iniciar o Spring Boot",
    ],
    correctOption: 1,
    explanation: "Cada @Test representa um cenário verificável. Um não deve depender do resultado deixado pelo outro.",
  },
  {
    prompt: "Qual sequência combina com TDD?",
    options: [
      "Implementar tudo, apresentar e depois pensar em testes",
      "Criar o banco, criar a tela e remover os testes que falharem",
      "Escrever o teste, vê-lo falhar, implementar o necessário e melhorar o código",
      "Copiar o teste pronto e ajustar até ficar verde sem ler o resultado",
    ],
    correctOption: 2,
    explanation: "O ciclo clássico é vermelho, verde e refatoração: falhar primeiro, funcionar e depois melhorar.",
  },
  {
    prompt: "Qual diferença prática separa um stub de um mock?",
    options: [
      "O stub só existe no Spring, enquanto o mock só existe no JUnit",
      "O mock sempre usa banco real e o stub nunca usa",
      "Não existe diferença; são nomes para exatamente a mesma coisa",
      "O stub entrega respostas combinadas; o mock também pode conferir como foi chamado",
    ],
    correctOption: 3,
    explanation: "O stub fornece dados previsíveis. O mock, além disso, pode verificar se uma interação esperada aconteceu.",
  },
  {
    prompt: "A página visual e o comando de testes têm o mesmo papel?",
    options: [
      "Não. A página ajuda a demonstrar; os testes automatizados validam regras repetidamente",
      "Sim. Se o formulário abriu, todos os testes passaram",
      "Sim. Os dois são apenas formas diferentes de calcular imposto",
      "Não. A página substitui o Maven e dispensa qualquer teste",
    ],
    correctOption: 0,
    explanation: "A tela torna o fluxo visível, mas é a suíte automatizada que repete as verificações de forma confiável.",
  },
  {
    prompt: "Mudamos de propósito o valor esperado e apareceu BUILD FAILURE. O que isso significa?",
    options: [
      "Que o Maven estragou o projeto",
      "Que o teste encontrou a diferença que deveria encontrar",
      "Que todo teste de integração terminou com erro de configuração",
      "Que a aplicação precisa ser publicada antes de testar",
    ],
    correctOption: 1,
    explanation: "Uma falha provocada mostra que o teste está atento e não está apenas passando por decoração.",
  },
];

export function publicQuestion(index: number) {
  const question = QUIZ_QUESTIONS[index];
  if (!question) return null;
  return { index, prompt: question.prompt, options: question.options };
}
