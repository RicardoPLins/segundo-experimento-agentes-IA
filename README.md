# segundo-experimento-agentes-IA
Repositório para o segundo experimento prático da disciplina "IA Codificação 2026.1" - Mestrado Cin - UFPE

## Visão geral

Este repositório contém um sistema web (frontend + backend) em:

- Backend: Node.js + TypeScript + Express (API)
- Frontend: React + Vite + MUI

O backend roda por padrão em `http://localhost:4000` e o frontend em `http://localhost:5173`.

## Requisitos

- Node.js (recomendado: versão 20+)
- npm

## Como rodar (modo desenvolvimento)

### 1) Backend (API)

Em um terminal:

```bash
cd sistema/apps/backend
npm install
```

Crie um arquivo `sistema/apps/backend/.env` com as variáveis necessárias (ver seção “Variáveis de ambiente”).

Depois execute:

```bash
npm run dev
```

Saúde da API:

```bash
curl -sS http://localhost:4000/health
```

### 2) Frontend (Web)

Em outro terminal:

```bash
cd sistema/apps/frontend
npm install
npm run dev
```

Abra o app em `http://localhost:5173`.

## Variáveis de ambiente

### Backend (`sistema/apps/backend/.env`)

O backend carrega variáveis automaticamente via `dotenv` (importado no bootstrap).

Obrigatórias para envio real de e-mails via SendGrid:

```bash
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM=seu-remetente@seu-dominio.com
```

Opcional:

```bash
# Porta do backend (default: 4000)
PORT=4000
```

Notas importantes (SendGrid):

- `SENDGRID_FROM` deve ser um remetente permitido/validado no SendGrid (Single Sender Verification ou domínio autenticado).
- A API key precisa ter permissão de “Mail Send”.
- Se o envio retornar **403 Forbidden**, normalmente é permissão da key e/ou remetente não verificado.

### Frontend (opcional)

Por padrão o frontend chama a API em `http://localhost:4000`.
Se quiser apontar para outra URL, crie `sistema/apps/frontend/.env.local`:

```bash
VITE_API_BASE=http://localhost:4000
```

## Envio de e-mails

O envio de e-mail usa o e-mail cadastrado do aluno.

### Via interface

- Cadastre alunos e turmas.
- Matricule alunos em uma turma.
- Preencha as avaliações (os campos começam como `None`; você deve escolher apenas `MANA`, `MPA` ou `MA`).
- Após preencher tudo, use a opção de envio individual por aluno na tela de avaliações.

### Via API (curl)

O endpoint de envio individual é:

- `POST http://localhost:4000/jobs/send-student-digest`

Exemplo:

```bash
curl -sS -X POST http://localhost:4000/jobs/send-student-digest \
	-H 'Content-Type: application/json' \
	-d '{"studentId":"<UUID_DO_ALUNO>","classId":"<UUID_DA_TURMA>"}'
```

Também existe:

- `POST http://localhost:4000/jobs/send-daily-digests`

## Build (produção)

### Backend

```bash
cd sistema/apps/backend
npm run build
npm start
```

### Frontend

```bash
cd sistema/apps/frontend
npm run build
npm run preview
```

## Troubleshooting

- **Erro 403 (Forbidden) ao enviar e-mail (SendGrid):** verifique se o remetente (`SENDGRID_FROM`) está verificado e se a API key tem permissão “Mail Send”.
- **Erro de CORS:** o backend usa `cors()` liberado por padrão; confirme se o frontend está chamando a base correta (`VITE_API_BASE`).
- **Portas em uso:** altere `PORT` no backend ou a porta do Vite (veja documentação do Vite).

## Segurança

- Não commite arquivos `.env` com credenciais.
- Se uma credencial vazou, revogue/rotacione imediatamente (SendGrid API key etc.).
