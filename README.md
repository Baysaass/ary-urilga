# Шинэ гэрийн цайллагын урилга

## Local development

```sh
npm install
npm run dev
```

Open http://127.0.0.1:3000/. The Vite development server includes the invitation API.

## Production

```sh
npm run build
npm start
```

The Express server serves both the built website and its API. Hosting must run this Node server: uploading only `dist` to static hosting will not provide shared guest data.

- `PORT`: HTTP port, default `3000`.
- `ADMIN_PIN`: host PIN; set this in the hosting environment. Local default is `2026`.
- `INVITATION_DATA_FILE`: absolute path to the saved guest data; default `.data/invitation.json`. Use a persistent disk on the deployed server and back up this file. Run one server instance with this file.

Opening the invitation creates a persistent guest cookie. Guests can leave several different symbolic gifts, once per type. Each guest has one reaction per blessing; selecting a different reaction replaces the previous choice. Counts are calculated from saved guest choices, with no seeded totals. Guest identity is per browser; a new browser/device receives a new identity.

Named blessings appear immediately in the carousel and wall. Open invitation pages refresh shared data every five seconds. The host can hide, edit or delete submitted blessings. Event text and RSVP settings retain the existing local browser storage behavior.

The bundled music is `public/audio/nair.mp3` and plays only after pressing the audio button.

The hero uses the supplied portrait in `public/images/hero-portrait.png`, with the invitation text above and below the faces.

The opening cover scrubs `public/video/invitation-opening.mp4` with document scrolling, then fades the completed envelope to reveal the invitation. Scrolling back above the invitation reveals the same video and reverses it to close the envelope; it remains mounted after opening. The invitation stays pinned during this opening distance, so both directions use one continuous scroll without a page jump. This silent, seek-optimized copy starts after the supplied video's initial still hold. Keyboard users can use Page Down or Enter; reduced-motion users see the still poster and can skip directly to the invitation.

Typography uses the installed Mogul Anastasia Script and Apple system/SF Pro fonts. Devices without those fonts use the bundled Pacifico and Inter WOFF2 fonts in `public/fonts`, with their OFL licenses. All four fonts support Mongolian Cyrillic, including Ө and Ү.

## Checks

```sh
npm run lint
npm run build
node --import tsx --test server/invitation-api.test.ts
```

The API integration test uses a separate temporary data file and verifies independent guests, concurrent duplicate presses, reaction changes, validation, host moderation and persistence after restart.
