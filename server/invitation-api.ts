import express, { type Request } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { Blessing } from '../src/types';
import { SYMBOLIC_GIFTS, type Reaction } from '../src/lib/guest-data';

interface Guest { gifts: string[]; reactions: Record<string, Reaction> }
interface Data { revision: number; blessings: Blessing[]; guests: Record<string, Guest> }
const REACTIONS: Reaction[] = ['heart', 'sparkle', 'pray'];
const COOKIE = 'mhw_guest';

export function createInvitationApi(dataPath = resolve(process.env.INVITATION_DATA_FILE || '.data/invitation.json')) {
  const router = express.Router();
  const hostSessions = new Set<string>();
  let data: Data;
  let loading: Promise<void>;
  let queue: Promise<unknown> = Promise.resolve();

  async function load() {
    loading ??= (async () => {
      try { data = JSON.parse(await readFile(dataPath, 'utf8')); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        data = { revision: 0, blessings: [], guests: {} };
      }
    })();
    await loading;
  }
  async function persist() {
    await mkdir(dirname(dataPath), { recursive: true });
    const temporary = `${dataPath}.tmp`;
    await writeFile(temporary, JSON.stringify(data, null, 2));
    await rename(temporary, dataPath);
  }
  function cookie(req: Request, name: string) {
    return req.headers.cookie?.split(';').map(value => value.trim()).reverse().find(value => value.startsWith(`${name}=`))?.slice(name.length + 1);
  }
  function guest(req: Request) { return data.guests[cookie(req, COOKIE) || '']; }
  function isHost(req: Request) { return hostSessions.has(cookie(req, 'mhw_host') || ''); }
  function snapshot(req: Request) {
    const viewer = guest(req);
    const guests = Object.values(data.guests);
    return {
      revision: data.revision,
      blessings: data.blessings.filter(b => isHost(req) || b.status === 'approved').map(b => ({
        ...b,
        reactions: Object.fromEntries(REACTIONS.map(type => [type, guests.filter(g => g.reactions[b.id] === type).length])),
      })),
      gifts: SYMBOLIC_GIFTS.map(g => ({ ...g, count: guests.filter(visitor => visitor.gifts.includes(g.id)).length })),
      selectedGifts: viewer?.gifts || [],
      reactions: viewer?.reactions || {},
    };
  }
  router.use(express.json({ limit: '16kb' }));
  router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET' && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
      res.status(403).json({ error: 'Урилгын хуудсаас оролдоно уу.' });
      return;
    }
    next();
  });
  router.get('/', async (req, res, next) => {
    try { await load(); await queue; res.json(snapshot(req)); } catch (error) { next(error); }
  });
  router.post('/host/login', async (req, res, next) => {
    try {
      await load();
      if (req.body.pin !== (process.env.ADMIN_PIN || '2026')) { res.status(401).json({ error: 'ПИН код буруу байна.' }); return; }
      const token = randomUUID();
      hostSessions.add(token);
      res.cookie('mhw_host', token, { httpOnly: true, sameSite: 'lax', secure: req.secure, path: '/api/invitation' });
      // Include the newly authenticated host's data in this response.
      req.headers.cookie = `${req.headers.cookie || ''}; mhw_host=${token}`;
      res.json(snapshot(req));
    } catch (error) { next(error); }
  });

  // Serialize mutations so simultaneous guests cannot overwrite each other's counts.
  router.use(async (req, res, next) => {
    if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) { next(); return; }
    const work = queue.then(async () => {
      await load();
      const before = structuredClone(data);
      try {
        if (req.path === '/open' && req.method === 'POST') {
          let id = cookie(req, COOKIE);
          if (!id || !data.guests[id]) {
            id = randomUUID();
            data.guests[id] = { gifts: [], reactions: {} };
            res.cookie(COOKIE, id, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: 365 * 86400000, path: '/' });
            req.headers.cookie = `${req.headers.cookie || ''}; ${COOKIE}=${id}`;
          }
        } else if (req.path === '/host/reset' && req.method === 'POST') {
          if (!isHost(req)) { res.status(401).json({ error: 'Гэрийн эзэн нэвтэрнэ үү.' }); return; }
          data.blessings = [];
          Object.values(data.guests).forEach(visitor => { visitor.gifts = []; visitor.reactions = {}; });
        } else if (req.path.startsWith('/host/blessings/')) {
          if (!isHost(req)) { res.status(401).json({ error: 'Гэрийн эзэн нэвтэрнэ үү.' }); return; }
          const id = req.path.split('/').pop();
          const blessing = data.blessings.find(b => b.id === id);
          if (!blessing) { res.status(404).json({ error: 'Ерөөл олдсонгүй.' }); return; }
          if (req.method === 'DELETE') data.blessings = data.blessings.filter(b => b.id !== id);
          else if (req.method === 'PATCH') {
            if (['pending', 'approved', 'rejected', 'hidden'].includes(req.body.status)) blessing.status = req.body.status;
            if (typeof req.body.message === 'string' && req.body.message.trim()) blessing.message = req.body.message.trim().slice(0, 2000);
          } else { next(); return; }
        } else {
          const visitor = guest(req);
          if (!visitor) { res.status(401).json({ error: 'Эхлээд урилгаа нээнэ үү.' }); return; }
          if (req.path === '/blessings' && req.method === 'POST') {
            const name = typeof req.body.guest_name === 'string' ? req.body.guest_name.trim() : '';
            const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
            if (!name || name.length > 80 || !message || message.length > 2000) {
              res.status(400).json({ error: 'Нэр болон ерөөлөө бүрэн оруулна уу.' }); return;
            }
            const now = new Date().toISOString();
            data.blessings.unshift({ id: randomUUID(), guest_name: name, message, anonymous: false, status: 'approved', reactions: { heart: 0, sparkle: 0, pray: 0 }, created_at: now, approved_at: now });
          } else if (req.path === '/gifts' && req.method === 'POST') {
            if (!SYMBOLIC_GIFTS.some(g => g.id === req.body.id)) { res.status(400).json({ error: 'Бэлгэдэл олдсонгүй.' }); return; }
            if (!visitor.gifts.includes(req.body.id)) visitor.gifts.push(req.body.id);
          } else if (req.path === '/reactions' && req.method === 'POST') {
            if (!REACTIONS.includes(req.body.type) || !data.blessings.some(b => b.id === req.body.id && b.status === 'approved')) {
              res.status(400).json({ error: 'Ерөөл олдсонгүй.' }); return;
            }
            visitor.reactions[req.body.id] = req.body.type;
          } else { next(); return; }
        }
        if (JSON.stringify(data) !== JSON.stringify(before)) { data.revision += 1; await persist(); }
        res.json(snapshot(req));
      } catch (error) { data = before; throw error; }
    });
    queue = work.catch(() => {});
    try { await work; } catch (error) { next(error); }
  });
  router.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Invitation API:', error);
    res.status(500).json({ error: 'Хадгалж чадсангүй. Дахин оролдоно уу.' });
  });
  return router;
}
