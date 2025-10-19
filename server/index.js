import express from 'express';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
+ const isProd = process.env.NODE_ENV === 'production';
+ // quando atrás de proxy/reverse proxy (Coolify/Traefik), habilitar trust proxy
+ app.set('trust proxy', 1);

const PORT = process.env.SERVER_PORT || 4000;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:5173`;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.error('Faltam variáveis de ambiente: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI');
  process.exit(1);
}

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
-    secure: false, // ajuste para true se usar HTTPS
+    secure: isProd, // true em produção
    sameSite: 'lax',
  },
}));

function generateState() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// Inicia OAuth: redireciona para Google Consent Screen
app.get('/api/auth/google', (req, res) => {
  const scope = [
    'https://www.googleapis.com/auth/calendar.readonly',
  ].join(' ');

  const state = generateState();
  req.session.state = state;

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scope);
  authUrl.searchParams.set('access_type', 'offline'); // para receber refresh_token
  authUrl.searchParams.set('prompt', 'consent'); // garante refresh_token
  authUrl.searchParams.set('include_granted_scopes', 'true');
  authUrl.searchParams.set('state', state);

  return res.redirect(authUrl.toString());
});

// Callback que troca o "code" por tokens
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).send('Code inválido');

    // valida state
    if (!state || state !== req.session.state) {
      return res.status(400).send('State inválido');
    }
    req.session.state = undefined;

    const params = new URLSearchParams({
      code: String(code),
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const tokens = tokenRes.data; // { access_token, expires_in, refresh_token, token_type, scope }

    req.session.tokens = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + (tokens.expires_in ? tokens.expires_in * 1000 : 0),
    };

    // Redireciona para o frontend com sucesso
    const redirect = new URL(FRONTEND_URL);
    redirect.searchParams.set('auth', 'success');
    return res.redirect(redirect.toString());
  } catch (err) {
    console.error('Erro no callback do Google OAuth:', err.response?.data || err.message);
    return res.status(500).send('Falha na autenticação');
  }
});

async function ensureAccessToken(sessionData) {
  if (!sessionData?.tokens) return null;
  const { access_token, refresh_token, expiry_date } = sessionData.tokens;

  if (access_token && expiry_date && Date.now() < expiry_date - 30_000) {
    return access_token; // ainda válido
  }

  if (!refresh_token) return null;

  // refresh do token
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token,
    grant_type: 'refresh_token',
  });
  try {
    const resp = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const data = resp.data; // { access_token, expires_in }
    sessionData.tokens.access_token = data.access_token;
    sessionData.tokens.expiry_date = Date.now() + (data.expires_in ? data.expires_in * 1000 : 0);
    return data.access_token;
  } catch (e) {
    console.error('Erro ao atualizar access token:', e.response?.data || e.message);
    return null;
  }
}

// API para listar eventos do calendário
app.get('/api/calendar/events', async (req, res) => {
  try {
    const accessToken = await ensureAccessToken(req.session);
    if (!accessToken) return res.status(401).json({ error: 'Não autenticado' });

    const params = {
      maxResults: 10,
      orderBy: 'startTime',
      singleEvents: true,
      timeMin: new Date().toISOString(),
    };

    const response = await axios.get('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    return res.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Falha ao buscar eventos' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});