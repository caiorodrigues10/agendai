import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

const SECRET = process.env.JWT_SECRET || 'agendai_dev_secret';
const ACCESS_TTL = '15m';
const REFRESH_TTL = '7d';

const sanitizeValue = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/[<>]/g, '').trim();
};

const sanitizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  if (Array.isArray(body)) return body.map(sanitizeBody);
  return Object.entries(body).reduce((acc, [key, value]) => {
    acc[key] = sanitizeBody(sanitizeValue(value));
    return acc;
  }, {});
};

const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  role: user.role,
  barbershopId: user.barbershopId || null
});

const createTokens = (user) => {
  const payload = buildUserPayload(user);
  const accessToken = jwt.sign(payload, SECRET, { expiresIn: ACCESS_TTL });
  const refreshToken = jwt.sign(payload, SECRET, { expiresIn: REFRESH_TTL });
  return { accessToken, refreshToken };
};

server.use(helmet());
server.use(cors({
  origin: ['http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
server.use(rateLimit({ windowMs: 60 * 1000, max: 500 }));
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.body) req.body = sanitizeBody(req.body);
  next();
});

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = router.db.get('users').find({ email }).value();

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }

  const tokens = createTokens(user);
  return res.json({ user: buildUserPayload(user), ...tokens });
});

server.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token ausente' });
  try {
    const payload = jwt.verify(refreshToken, SECRET);
    const user = router.db.get('users').find({ id: payload.id }).value();
    if (!user) return res.status(401).json({ message: 'Usuário inválido' });
    const tokens = createTokens(user);
    return res.json({ user: buildUserPayload(user), ...tokens });
  } catch {
    return res.status(401).json({ message: 'Refresh token inválido' });
  }
});

server.get('/api/auth/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token ausente' });
  try {
    const payload = jwt.verify(token, SECRET);
    const user = router.db.get('users').find({ id: payload.id }).value();
    if (!user) return res.status(401).json({ message: 'Usuário inválido' });
    return res.json({ user: buildUserPayload(user) });
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

const isPublicRequest = (req) => {
  if (req.path.startsWith('/api/auth')) return true;
  if (req.method === 'GET' && req.path.startsWith('/api/services')) return true;
  if (req.method === 'GET' && req.path.startsWith('/api/barbershops')) return true;
  if (req.method === 'GET' && req.path.startsWith('/api/queue')) return true;
  if (req.method === 'POST' && req.path.startsWith('/api/queue')) return true;
  if (req.method === 'POST' && req.path.startsWith('/api/appointments')) return true;
  return false;
};

server.use((req, res, next) => {
  if (isPublicRequest(req)) return next();
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token ausente' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

server.use((req, res, next) => {
  if (!req.user) return next();
  if (req.user.role === 'admin') return next();
  const barbershopId = req.user.barbershopId;
  if (!barbershopId) return res.status(403).json({ message: 'Barbearia inválida' });
  const pathParts = req.path.replace('/api/', '').split('/');
  const collection = pathParts[0];
  const scopeCollections = ['services', 'appointments', 'queue', 'feed', 'users'];
  if (collection === 'barbershops') {
    req.query.id = barbershopId;
  }
  if (scopeCollections.includes(collection)) {
    req.query.barbershopId = barbershopId;
  }
  return next();
});

server.use((req, res, next) => {
  if (!req.user) return next();
  const pathParts = req.path.replace('/api/', '').split('/');
  const collection = pathParts[0];
  if (['services', 'barbershops', 'users'].includes(collection)) {
    if (!['admin', 'owner'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado' });
    }
  }
  return next();
});

server.post('/api/queue', (req, res) => {
  const { customerName, whatsapp, serviceId, barbershopId, customerId } = req.body || {};
  if (!customerName || !whatsapp || !serviceId || !barbershopId) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  const queueItem = {
    id: randomUUID(),
    customerName,
    whatsapp,
    serviceId,
    barbershopId,
    customerId: customerId || randomUUID(),
    joinedAt: Date.now(),
    status: 'waiting',
    addedByStaff: false
  };
  router.db.get('queue').push(queueItem).write();
  return res.status(201).json(queueItem);
});

server.post('/api/appointments', (req, res) => {
  const { customerName, whatsapp, serviceId, staffId, date, time, barbershopId } = req.body || {};
  if (!customerName || !whatsapp || !serviceId || !date || !time || !barbershopId) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  const appointment = {
    id: randomUUID(),
    customerName,
    whatsapp,
    serviceId,
    staffId: staffId || 'any',
    date,
    time,
    barbershopId,
    createdAt: Date.now(),
    status: 'confirmed'
  };
  router.db.get('appointments').push(appointment).write();
  return res.status(201).json(appointment);
});

server.use(jsonServer.rewriter({ '^/api/(.*)': '/$1' }));
server.use(router);

server.listen(4000, () => {
  console.log('Mock API running on http://localhost:4000');
});
