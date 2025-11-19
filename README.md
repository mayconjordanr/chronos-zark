# CHRONOS (Zark Edition)

**SaaS Life OS for ADHD** - A minimalist, futuristic financial and life management system designed to reduce friction and cognitive load.

## 🚀 Features

- **Headless-first**: Designed to be used via WhatsApp/Voice (n8n Agent).
- **TDAH UX**: Minimalist interface, dark mode (Zinc-950), immediate feedback.
- **Modular**: Starts with Finance, extensible to Health, Studies, etc.
- **Stack**: Next.js 15, TailwindCSS, Supabase, Docker.

## 🛠️ Setup Local

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/chronos-zark.git
    cd chronos-zark
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o Ambiente:**
    Renomeie `.env.example` para `.env.local` e preencha as chaves:
    ```bash
    cp .env.example .env.local
    ```

4.  **Rode o projeto:**
    ```bash
    npm run dev
    ```
    Acesse: `http://localhost:3000`

## 🐳 Deploy (Docker)

O projeto está configurado para deploy via Docker Compose.

1.  **Build & Up:**
    ```bash
    docker-compose up -d --build
    ```

2.  **Nginx (Proxy Reverso):**
    Copie o arquivo de configuração:
    ```bash
    sudo cp nginx/chronos.conf /etc/nginx/sites-available/chronos
    sudo ln -s /etc/nginx/sites-available/chronos /etc/nginx/sites-enabled/
    ```

## 🔑 Variáveis de Ambiente

| Variável | Descrição |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave Pública (Anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave Privada (Service Role) - **NUNCA EXPOR NO FRONT** |
| `N8N_AUTH_WEBHOOK_URL` | Webhook do n8n para Autenticação |

## 🛡️ Segurança

- **RLS (Row Level Security):** Ativado em todas as tabelas.
- **API Keys:** Autenticação via Header `x-api-key` para o Agente.
- **Docker:** Executa como usuário não-root (`nextjs`).

---
*Built by ZARK Industries*
