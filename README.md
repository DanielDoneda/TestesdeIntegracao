# BugBusters — Quiz de Testes de Integração

Quiz online e gamificado usado após a apresentação sobre testes de integração no ecossistema Spring Boot.

## Telas

- `/jogar`: entrada e prova dos participantes.
- `/controle`: criação da sala e liberação das questões pelo professor.
- `/placar`: classificação para deixar aberta no projetor.

## Regras da pontuação

- Cada questão começa valendo 1000 pontos.
- O valor diminui continuamente durante 20 segundos.
- Depois dos 20 segundos ainda é possível responder, valendo 1 ponto.
- Resposta incorreta vale 0.
- O horário oficial e a pontuação são calculados no servidor.

## Configuração do Supabase

1. Crie um projeto em [Supabase](https://supabase.com/).
2. Abra o SQL Editor e execute todo o arquivo `supabase/schema.sql`.
3. Copie `.env.example` para `.env.local`.
4. No painel do Supabase, copie a URL do projeto e crie uma chave secreta `sb_secret_...` em **Settings > API Keys**.
5. Escolha uma senha para `QUIZ_ADMIN_PASSWORD`.

Nunca envie `.env.local` ou a chave `service_role` ao GitHub.

## Execução local

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Publicação no Vercel

1. Importe este repositório no Vercel.
2. Cadastre `SUPABASE_URL`, `SUPABASE_SECRET_KEY` e `QUIZ_ADMIN_PASSWORD` nas Environment Variables.
3. Faça o deploy.

Depois disso, cada push enviado para a branch principal gera uma nova publicação automaticamente.

## Segurança

- A resposta correta não é enviada ao navegador antes da resposta do participante.
- A chave secreta do Supabase existe somente no servidor. O projeto ainda aceita a chave legada `SUPABASE_SERVICE_ROLE_KEY`, mas prefere o formato atual `SUPABASE_SECRET_KEY`.
- As tabelas usam Row Level Security e são acessadas pelas rotas protegidas do projeto.
- O painel do professor exige a senha configurada no ambiente.
