import express from 'express';
import { resolve } from 'node:path';
import { createInvitationApi } from './invitation-api';

const app = express();
app.use('/api/invitation', createInvitationApi());
app.use(express.static(resolve('dist')));
app.get('*', (_req, res) => res.sendFile(resolve('dist/index.html')));
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Invitation server is ready.'));
