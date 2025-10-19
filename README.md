# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/0d5944a0-914a-4b42-9177-71313fd3d46e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0d5944a0-914a-4b42-9177-71313fd3d46e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0d5944a0-914a-4b42-9177-71313fd3d46e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Backend (Node/Express) + Google OAuth

O projeto agora inclui um backend em Node/Express para autenticação segura com Google OAuth e leitura de eventos do Google Calendar.

### Variáveis de ambiente

As seguintes variáveis foram adicionadas ao arquivo `.env`:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (padrão: `http://localhost:4000/api/auth/google/callback`)
- `SESSION_SECRET`
- `SERVER_PORT` (padrão: `4000`)
- `FRONTEND_URL` (padrão: `http://localhost:5173`)

Certifique-se de trocar `SESSION_SECRET` por um valor forte em produção.

### Como rodar localmente

```sh
# instalar dependências (já feito no setup geral)
npm install

# iniciar backend
npm run server

# em outro terminal: iniciar frontend
npm run dev
```

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

### Fluxo de OAuth

- Inicie o fluxo de login acessando `GET /api/auth/google` (o backend redireciona para a tela de consentimento do Google).
- Após o consentimento, o Google redireciona para `GET /api/auth/google/callback` e o backend salva os tokens na sessão.
- Liste eventos via `GET /api/calendar/events` (usa o `access_token` e renova quando necessário com `refresh_token`).

### Endpoints úteis

- `GET /api/health` – healthcheck do backend
- `GET /api/auth/google` – inicia OAuth (redirect)
- `GET /api/auth/google/callback` – callback do OAuth
- `GET /api/calendar/events` – lista eventos do calendário principal
- `POST /api/auth/logout` – encerra a sessão

### Docker (backend)

Um Dockerfile foi adicionado para o backend.

```sh
# build da imagem
docker build -t daily-meet-backend .

# rodar o container (carrega .env)
docker run --env-file .env -p 4000:4000 daily-meet-backend
```

Observação: este Dockerfile sobe somente o backend. O frontend continua rodando via Vite ou pode ser containerizado separadamente, se desejar.
