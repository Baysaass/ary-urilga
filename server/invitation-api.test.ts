import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createInvitationApi } from './invitation-api';

test('guest submissions, unique gifts and one reaction per card persist across clients and restarts', async () => {
  const dataPath = resolve(`.data/test-${randomUUID()}.json`);
  const start = async () => {
    const app = express().use('/api/invitation', createInvitationApi(dataPath));
    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>(done => server.once('listening', done));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    return { server, base: `http://127.0.0.1:${address.port}/api/invitation` };
  };
  let running = await start();
  const close = () => new Promise<void>((done, reject) => running.server.close(error => error ? reject(error) : done()));
  async function call(path = '', body?: unknown, cookie = '', method = 'POST') {
    const res = await fetch(running.base + path, { method: body === undefined ? 'GET' : method, headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: res.status, data: await res.json(), cookie: res.headers.get('set-cookie')?.split(';')[0] || cookie };
  }
  try {
    const initial = await call();
    assert.equal(initial.data.blessings.length, 0);
    assert.ok(initial.data.gifts.every((g: { count: number }) => g.count === 0));
    assert.equal((await call('/gifts', { id: 'love' })).status, 401);
    assert.equal((await call('/blessings', { guest_name: 'Тест', message: 'Ерөөл' })).status, 401);
    const a = (await call('/open', {})).cookie;
    const b = (await call('/open', {})).cookie;
    assert.notEqual(a, b);
    assert.equal((await call('/blessings', { guest_name: '  ', message: 'Ерөөл' }, a)).status, 400);
    const submitted = await call('/blessings', { guest_name: 'Туршилтын зочин', message: 'Гэр бүлд нь аз жаргал хүсье.' }, a);
    assert.equal(submitted.status, 200);
    const id = submitted.data.blessings[0].id;
    assert.equal(submitted.data.blessings[0].status, 'approved');
    assert.equal(submitted.data.blessings[0].anonymous, false);
    assert.equal((await call('', undefined, b)).data.blessings[0].id, id);
    await Promise.all(Array.from({ length: 8 }, () => call('/gifts', { id: 'love' }, a)));
    await call('/gifts', { id: 'joy' }, a);
    await call('/gifts', { id: 'love' }, b);
    const gifts = (await call('', undefined, a)).data;
    assert.equal(gifts.gifts.find((g: { id: string }) => g.id === 'love').count, 2);
    assert.equal(gifts.gifts.find((g: { id: string }) => g.id === 'joy').count, 1);
    assert.deepEqual(gifts.selectedGifts, ['love', 'joy']);
    await Promise.all(Array.from({ length: 8 }, () => call('/reactions', { id, type: 'heart' }, a)));
    await call('/reactions', { id, type: 'heart' }, b);
    assert.equal((await call()).data.blessings[0].reactions.heart, 2);
    await call('/reactions', { id, type: 'sparkle' }, a);
    const changed = (await call('', undefined, a)).data;
    assert.deepEqual(changed.blessings[0].reactions, { heart: 1, sparkle: 1, pray: 0 });
    assert.equal(changed.reactions[id], 'sparkle');
    assert.equal((await call('/reactions', { id, type: 'invalid' }, a)).status, 400);
    assert.equal((await call(`/host/blessings/${id}`, { status: 'hidden' }, a, 'PATCH')).status, 401);
    await close();
    running = await start();
    const restored = (await call('', undefined, a)).data;
    assert.deepEqual(restored.blessings[0].reactions, { heart: 1, sparkle: 1, pray: 0 });
    assert.deepEqual(restored.selectedGifts, ['love', 'joy']);
    const host = (await call('/host/login', { pin: process.env.ADMIN_PIN || '2026' })).cookie;
    await call(`/host/blessings/${id}`, { status: 'hidden' }, host, 'PATCH');
    assert.equal((await call()).data.blessings.length, 0);
    assert.equal((await call('', undefined, host)).data.blessings[0].status, 'hidden');
  } finally {
    await close();
    await unlink(dataPath).catch(() => {});
  }
});
